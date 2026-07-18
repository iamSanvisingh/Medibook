ALTER TABLE "lab_reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "biomarkers" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "lab_reports" FORCE ROW LEVEL SECURITY;
ALTER TABLE "biomarkers" FORCE ROW LEVEL SECURITY;

CREATE POLICY doctor_isolation ON "lab_reports"
  USING ("doctorId" = current_setting('app.current_doctor_id', true));

CREATE POLICY biomarker_isolation ON "biomarkers"
  USING ("reportId" IN (
    SELECT id FROM "lab_reports"
    WHERE "doctorId" = current_setting('app.current_doctor_id', true)
  ));