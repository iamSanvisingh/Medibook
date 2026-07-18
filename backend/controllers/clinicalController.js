import { prisma } from '../config/prisma.js'
import appointmentModel from '../models/appointmentModel.js'
import fs from 'fs'
import { PDFParse } from 'pdf-parse'
import { v2 as cloudinary } from 'cloudinary'
import labReportRawModel from '../models/labReportRawModel.js'
import { genAI, GEMINI_MODEL } from '../config/gemini.js'
import { geminiResponseSchema, labReportAiResultSchema, buildLabReportPrompt } from '../utils/labReportAiSchema.js'

// POST /api/clinical/report/upload
// Doctor uploads a lab report file for a specific appointment. This does
// NOT call Gemini yet — it only handles storage + text extraction. The
// report sits in "parsing" status until the AI step (next phase) fills
// in the actual biomarkers.
export const uploadLabReport = async (req, res) => {
  try {
    const doctorId = req.user.id
    const { appointmentId, chiefComplaint, allergies, familyHistory } = req.body

    if (!appointmentId) {
      return res.json({ success: false, message: 'appointmentId is required' })
    }
    if (!req.file) {
      return res.json({ success: false, message: 'No file uploaded' })
    }

    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }
    if (appointment.docId !== doctorId) {
      return res.json({ success: false, message: 'This appointment does not belong to you' })
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.json({ success: false, message: 'Only PDF lab reports are supported right now.' })
    }

    const fileUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: 'auto' })

    const fileBuffer = fs.readFileSync(req.file.path)
    const parser = new PDFParse({ data: fileBuffer })
    const textResult = await parser.getText()
    const extractedText = textResult.text
    await parser.destroy()

    if (!extractedText || extractedText.trim().length < 20) {
      return res.json({ success: false, message: 'Could not extract readable text from this PDF.' })
    }

    const report = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_doctor_id', ${doctorId}, true)`
      return tx.labReport.create({
        data: {
          patientId: appointment.userId,
          doctorId,
          appointmentId,
          chiefComplaint: chiefComplaint || null,
          allergies: allergies ? JSON.parse(allergies) : [],
          familyHistory: familyHistory ? JSON.parse(familyHistory) : [],
          status: 'parsing',
          sourceFileUrl: fileUpload.secure_url,
        }
      })
    })

    await labReportRawModel.create({
      reportId: report.id,
      extractedText,
      sourceFileUrl: fileUpload.secure_url,
    })

    res.json({
      success: true,
      reportId: report.id,
      status: 'parsing',
      message: 'File uploaded and text extracted.'
    })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const computeStatus = (value, refLow, refHigh) => {
  if (refLow == null || refHigh == null) return 'NORMAL'
  if (value < refLow) return 'LOW'
  if (value > refHigh) {
    return value > refHigh * 1.25 ? 'CRITICAL' : 'HIGH'
  }
  return 'NORMAL'
}

// POST /api/clinical/report/:id/parse
// Runs AI extraction on a report that's already been uploaded (status
// 'parsing'). Separated from the upload step deliberately — this is
// exactly the piece that becomes a background job when we add
// Redis + BullMQ later, so keeping it as its own endpoint now means
// the eventual queue worker can call this same logic unchanged.
export const parseLabReportWithAI = async (req, res) => {
  try {
    const doctorId = req.user.id
    const { id } = req.params

    const report = await prisma.labReport.findUnique({ where: { id } })
    if (!report) return res.json({ success: false, message: 'Report not found' })
    if (report.doctorId !== doctorId) return res.json({ success: false, message: 'Not authorized for this report' })

    const rawDoc = await labReportRawModel.findOne({ reportId: id })
    if (!rawDoc) return res.json({ success: false, message: 'No extracted text found for this report' })

    const response = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildLabReportPrompt(rawDoc.extractedText),
      config: {
        responseMimeType: 'application/json',
        responseSchema: geminiResponseSchema,
      }
    })

    let parsed
    try {
      parsed = JSON.parse(response.text)
    } catch (e) {
      return res.json({ success: false, message: 'Gemini returned invalid JSON' })
    }

    const validation = labReportAiResultSchema.safeParse(parsed)
    if (!validation.success) {
      console.log('Zod validation failed:', validation.error.issues)
      return res.json({ success: false, message: 'AI output failed validation', issues: validation.error.issues })
    }

    const result = validation.data

    const updated = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_doctor_id', ${doctorId}, true)`
      await tx.biomarker.deleteMany({ where: { reportId: id } })
      return tx.labReport.update({
        where: { id },
        data: {
          status: 'ready',
          aiSummary: result.aiSummary,
          riskTags: result.riskTags,
          recommendedActions: result.recommendedActions,
          biomarkers: {
            create: result.biomarkers.map(b => ({
              name: b.name,
              value: b.value,
              unit: b.unit || null,
              refLow: b.refLow ?? null,
              refHigh: b.refHigh ?? null,
              category: b.category || null,
              status: computeStatus(b.value, b.refLow, b.refHigh),
            }))
          }
        },
        include: { biomarkers: true }
      })
    })

    res.json({ success: true, report: updated })

  } catch (error) {
    console.log(error)
    await prisma.labReport.update({
      where: { id: req.params.id },
      data: { status: 'failed' }
    }).catch(() => {})
    res.json({ success: false, message: error.message })
  }
}

// POST /api/clinical/report
// doctorId comes from the verified JWT. patientId is NEVER accepted
// directly from the client — it's derived by looking up the appointment
// this report is tied to, and confirming that appointment actually
// belongs to the logged-in doctor. This is what makes the patientId
// trustworthy: it's read from a Mongo document the doctor is
// authorized to access, not typed in by whoever's calling the API.
export const createLabReport = async (req, res) => {
  try {
    const doctorId = req.user.id
    const { appointmentId, chiefComplaint, allergies, familyHistory, biomarkers } = req.body

    if (!appointmentId) {
      return res.json({ success: false, message: 'appointmentId is required' })
    }

    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (appointment.docId !== doctorId) {
      return res.json({ success: false, message: 'This appointment does not belong to you' })
    }

    const patientId = appointment.userId

    const report = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_doctor_id', ${doctorId}, true)`
      return tx.labReport.create({
        data: {
          patientId,
          doctorId,
          appointmentId,
          chiefComplaint: chiefComplaint || null,
          allergies: allergies || [],
          familyHistory: familyHistory || [],
          status: 'ready',
          biomarkers: {
            create: (biomarkers || []).map(b => ({
              name: b.name,
              value: b.value,
              unit: b.unit || null,
              refLow: b.refLow ?? null,
              refHigh: b.refHigh ?? null,
              category: b.category || null,
              status: computeStatus(b.value, b.refLow, b.refHigh),
            }))
          }
        },
        include: { biomarkers: true }
      })
    })

    res.json({ success: true, report })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export const getLabReport = async (req, res) => {
  try {
    const doctorId = req.user.id
    const { id } = req.params

    const report = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_doctor_id', ${doctorId}, true)`
      return tx.labReport.findUnique({
        where: { id },
        include: { biomarkers: true }
      })
    })

    if (!report) return res.json({ success: false, message: 'Report not found' })
    res.json({ success: true, report })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export const getReportsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params

    if (req.body.userId !== patientId) {
      return res.json({ success: false, message: 'Not authorized to view these reports' })
    }

    const reports = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_patient_id', ${patientId}, true)`
      return tx.labReport.findMany({
        where: { patientId },
        include: { biomarkers: true },
        orderBy: { createdAt: 'desc' }
      })
    })

    res.json({ success: true, reports })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export const getTriageQueue = async (req, res) => {
  try {
    const doctorId = req.user.id

    const reports = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_doctor_id', ${doctorId}, true)`

      return tx.labReport.findMany({
        where: { doctorId },
        include: {
          biomarkers: { where: { status: { not: 'NORMAL' } } }
        },
        orderBy: { createdAt: 'desc' }
      })
    })

    const queue = reports.map(r => ({
      reportId: r.id,
      patientId: r.patientId,
      appointmentId: r.appointmentId,
      chiefComplaint: r.chiefComplaint,
      flagCount: r.biomarkers.length,
      status: r.status,
    }))

    res.json({ success: true, queue })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}