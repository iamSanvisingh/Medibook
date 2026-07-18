import mongoose from "mongoose"

const labReportRawSchema = new mongoose.Schema({
    reportId: { type: String, required: true, unique: true }, // matches the Postgres LabReport.id
    extractedText: { type: String, required: true },
    sourceFileUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
})

const labReportRawModel = mongoose.models.labReportRaw || mongoose.model("labReportRaw", labReportRawSchema)
export default labReportRawModel