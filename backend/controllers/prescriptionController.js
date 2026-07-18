import prescriptionModel from '../models/prescriptionModel.js'
import appointmentModel from '../models/appointmentModel.js'

// POST /api/prescription/create
// Same authorization pattern as createLabReport: doctorId from the
// verified JWT, patientId derived from the appointment record — never
// trusted directly from the client.
export const createPrescription = async (req, res) => {
  try {
    const doctorId = req.user.id
    const { appointmentId, medications, notes } = req.body

    if (!appointmentId || !medications || medications.length === 0) {
      return res.json({ success: false, message: 'appointmentId and at least one medication are required' })
    }

    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }
    if (appointment.docId !== doctorId) {
      return res.json({ success: false, message: 'This appointment does not belong to you' })
    }

    const prescription = await prescriptionModel.create({
      doctorId,
      patientId: appointment.userId,
      appointmentId,
      medications,
      notes: notes || '',
    })

    res.json({ success: true, prescription })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// GET /api/prescription/patient/:patientId
// Shared by both the doctor (viewing a selected patient's history in the
// Clinical Dashboard) and the patient themselves (viewing their own) —
// same convention as /api/clinical/patient/:patientId.
export const getPrescriptionsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params

    if (req.body.userId !== patientId) {
      return res.json({ success: false, message: 'Not authorized to view these prescriptions' })
    }

    const prescriptions = await prescriptionModel.find({ patientId }).sort({ createdAt: -1 })
    res.json({ success: true, prescriptions })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}