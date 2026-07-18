-- CreateIndex
CREATE INDEX "biomarkers_reportId_idx" ON "biomarkers"("reportId");

-- CreateIndex
CREATE INDEX "biomarkers_status_idx" ON "biomarkers"("status");

-- CreateIndex
CREATE INDEX "lab_reports_patientId_idx" ON "lab_reports"("patientId");

-- CreateIndex
CREATE INDEX "lab_reports_doctorId_idx" ON "lab_reports"("doctorId");

-- CreateIndex
CREATE INDEX "lab_reports_status_idx" ON "lab_reports"("status");
