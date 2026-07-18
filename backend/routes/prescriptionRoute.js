import express from 'express'
import authDoctor from '../middlewares/authDoctor.js'
import { createPrescription, getPrescriptionsForPatient } from '../controllers/prescriptionController.js'
import authUser from '../middlewares/authUser.js'

const prescriptionRouter = express.Router()

prescriptionRouter.post('/create', authDoctor, createPrescription)
prescriptionRouter.get('/patient/:patientId', authUser, getPrescriptionsForPatient)

export default prescriptionRouter