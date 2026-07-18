import 'dotenv/config'
import crypto from 'crypto'
import { PrismaClient } from '../generated/prisma/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const NUM_REPORTS = 5000
const NUM_DOCTORS = 50   // ~100 reports per doctor on average — a realistic, meaningful filter ratio
const NUM_PATIENTS = 2000

const BIOMARKER_TEMPLATES = [
  { name: 'Fasting Blood Sugar', unit: 'mg/dL', refLow: 70, refHigh: 100 },
  { name: 'Hemoglobin', unit: 'g/dL', refLow: 13.5, refHigh: 17.5 },
  { name: 'HbA1c', unit: '%', refLow: 4, refHigh: 5.6 },
  { name: 'Total Cholesterol', unit: 'mg/dL', refLow: 125, refHigh: 200 },
  { name: 'Creatinine', unit: 'mg/dL', refLow: 0.66, refHigh: 1.25 },
  { name: 'Vitamin D', unit: 'ng/mL', refLow: 30, refHigh: 100 },
]

const randomStatus = () => {
  const r = Math.random()
  if (r < 0.6) return 'NORMAL'
  if (r < 0.8) return 'HIGH'
  if (r < 0.95) return 'LOW'
  return 'CRITICAL'
}
const uuid = () => crypto.randomUUID()

async function main() {
  // Temporarily bypass RLS for this bulk insert, regardless of its
  // current state — this script is self-contained and safe to run
  // whether or not you'd already restored the RLS policies.
  await prisma.$executeRawUnsafe(`ALTER TABLE "lab_reports" DISABLE ROW LEVEL SECURITY`)
  await prisma.$executeRawUnsafe(`ALTER TABLE "biomarkers" DISABLE ROW LEVEL SECURITY`)

  console.log(`Generating ${NUM_REPORTS} lab reports...`)

  const doctorIds = Array.from({ length: NUM_DOCTORS }, uuid)
  const patientIds = Array.from({ length: NUM_PATIENTS }, uuid)

  const reports = []
  const biomarkers = []

  for (let i = 0; i < NUM_REPORTS; i++) {
    const reportId = uuid()
    reports.push({
      id: reportId,
      patientId: patientIds[Math.floor(Math.random() * patientIds.length)],
      doctorId: doctorIds[Math.floor(Math.random() * doctorIds.length)],
      status: 'ready',
      chiefComplaint: 'Synthetic benchmark data',
    })

    const count = 3 + Math.floor(Math.random() * 4) // 3-6 biomarkers per report
    for (let j = 0; j < count; j++) {
      const t = BIOMARKER_TEMPLATES[Math.floor(Math.random() * BIOMARKER_TEMPLATES.length)]
      biomarkers.push({
        id: uuid(),
        reportId,
        name: t.name,
        unit: t.unit,
        refLow: t.refLow,
        refHigh: t.refHigh,
        value: t.refLow + Math.random() * (t.refHigh - t.refLow) * 1.5,
        status: randomStatus(),
      })
    }
  }

  // Bulk insert in batches — one createMany per 1000 rows, much faster
  // than one insert per row
  const BATCH = 1000
  for (let i = 0; i < reports.length; i += BATCH) {
    await prisma.labReport.createMany({ data: reports.slice(i, i + BATCH) })
  }
  console.log(`Inserted ${reports.length} lab_reports`)

  for (let i = 0; i < biomarkers.length; i += BATCH) {
    await prisma.biomarker.createMany({ data: biomarkers.slice(i, i + BATCH) })
  }
  console.log(`Inserted ${biomarkers.length} biomarkers`)

  // Restore RLS to how it should normally be
  await prisma.$executeRawUnsafe(`ALTER TABLE "lab_reports" ENABLE ROW LEVEL SECURITY`)
  await prisma.$executeRawUnsafe(`ALTER TABLE "biomarkers" ENABLE ROW LEVEL SECURITY`)
  await prisma.$executeRawUnsafe(`ALTER TABLE "lab_reports" FORCE ROW LEVEL SECURITY`)
  await prisma.$executeRawUnsafe(`ALTER TABLE "biomarkers" FORCE ROW LEVEL SECURITY`)

  console.log(`\nDone. Sample doctorId to benchmark with: ${doctorIds[0]}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })