import express from 'express'
import authDoctor from '../middlewares/authDoctor.js'
import upload from '../middlewares/multer.js'
import {
  createLabReport,
  getLabReport,
  getReportsForPatient,
  getTriageQueue,
  uploadLabReport,
  parseLabReportWithAI
} from '../controllers/clinicalController.js'
import authUser from '../middlewares/authUser.js'

const clinicalRouter = express.Router()

clinicalRouter.post('/report', authDoctor, createLabReport)
clinicalRouter.post('/report/upload', authDoctor, upload.single('report'), uploadLabReport)
clinicalRouter.post('/report/:id/parse', authDoctor, parseLabReportWithAI)
clinicalRouter.get('/report/:id', authDoctor, getLabReport)
clinicalRouter.get('/patient/:patientId', authUser, getReportsForPatient)
clinicalRouter.get('/triage', authDoctor, getTriageQueue)

export default clinicalRouter