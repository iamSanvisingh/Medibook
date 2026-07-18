-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'parsing', 'ready', 'failed');

-- CreateEnum
CREATE TYPE "BiomarkerStatus" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "lab_reports" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "chiefComplaint" TEXT,
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "familyHistory" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ReportStatus" NOT NULL DEFAULT 'pending',
    "aiSummary" TEXT,
    "riskTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendedActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceFileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biomarkers" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "refLow" DOUBLE PRECISION,
    "refHigh" DOUBLE PRECISION,
    "status" "BiomarkerStatus" NOT NULL DEFAULT 'NORMAL',
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biomarkers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "biomarkers" ADD CONSTRAINT "biomarkers_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "lab_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
