import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'
import mongoose from 'mongoose'
import appointmentModel from '../models/appointmentModel.js'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Connect to Mongo just long enough to grab one real appointment —
  // this is what makes the seed data trustworthy: patientId/doctorId
  // come from an appointment that actually exists, exactly like the
  // real createLabReport flow will require.
  await mongoose.connect(process.env.MONGODB_URI)

  const appointment = await appointmentModel.findOne().sort({ date: -1 })

  if (!appointment) {
    throw new Error('No appointments found in MongoDB — book at least one appointment first, then re-run the seed.')
  }

  console.log(`Using real appointment: patient ${appointment.userData.name}, doctor ${appointment.docData.name}`)

  await prisma.labReport.create({
    data: {
      patientId: appointment.userId,
      doctorId: appointment.docId,
      appointmentId: appointment._id.toString(),
      chiefComplaint: 'Fatigue, increased thirst, and blurred vision for 3 weeks.',
      allergies: ['Peanut allergy'],
      familyHistory: ['Family history of diabetes'],
      status: 'ready',
      aiSummary: 'Patient presents with markedly elevated fasting glucose (145 mg/dL) and HbA1c of 7.8%, consistent with a new diagnosis of Type 2 Diabetes Mellitus. Concurrent low hemoglobin (11.2 g/dL) suggests mild anemia that warrants iron studies. Renal and thyroid function remain within normal limits.',
      riskTags: ['Hyperglycemia — High', 'Mild Anemia', 'Family history of diabetes'],
      recommendedActions: [
        'Initiate Metformin 500mg BID and reassess in 4 weeks',
        'Order iron studies (ferritin, TIBC) to characterize anemia'
      ],
      biomarkers: {
        create: [
          { name: 'Fasting Blood Sugar', value: 145, unit: 'mg/dL', refLow: 70, refHigh: 100, status: 'HIGH', category: 'Metabolic' },
          { name: 'Hemoglobin', value: 11.2, unit: 'g/dL', refLow: 13.5, refHigh: 17.5, status: 'LOW', category: 'Hematology' },
          { name: 'HbA1c', value: 7.8, unit: '%', refLow: 4, refHigh: 5.6, status: 'HIGH', category: 'Metabolic' },
          { name: 'Total Cholesterol', value: 188, unit: 'mg/dL', refLow: 125, refHigh: 200, status: 'NORMAL', category: 'Lipid' },
        ]
      }
    }
  })

  console.log('Seed complete')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => {
    await prisma.$disconnect()
    await mongoose.disconnect()
  })