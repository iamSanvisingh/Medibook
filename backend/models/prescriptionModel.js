import mongoose from "mongoose"

const prescriptionSchema = new mongoose.Schema({
    doctorId: { type: String, required: true },
    patientId: { type: String, required: true },
    appointmentId: { type: String, required: true },
    medications: [{
        name: { type: String, required: true },
        dosage: { type: String, required: true },      // e.g. "500mg"
        frequency: { type: String, required: true },    // e.g. "Twice daily"
        duration: { type: String, required: true },     // e.g. "7 days"
        instructions: { type: String },                 // e.g. "After meals"
    }],
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
})
prescriptionSchema.index({ patientId: 1 })
prescriptionSchema.index({ doctorId: 1 })
const prescriptionModel = mongoose.models.prescription || mongoose.model("prescription", prescriptionSchema)
export default prescriptionModel