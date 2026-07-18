import express from 'express'
import { addDoctor, adminDashboard, allDoctors, appointmentCancel, appointmentsAdmin, loginAdmin,removeDoctor,getRevenueData} from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js';
import { changeAvailability } from '../controllers/doctorController.js';
import { loginLimiter } from '../middlewares/rateLimiter.js'

const adminRouter = express.Router();


adminRouter.post("/login", loginLimiter, loginAdmin)
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor)
adminRouter.get("/all-doctors", authAdmin, allDoctors)
adminRouter.post("/change-availability", authAdmin, changeAvailability)
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
adminRouter.get("/dashboard", authAdmin, adminDashboard)
adminRouter.post('/remove-doctor', authAdmin, removeDoctor)
adminRouter.get('/revenue', authAdmin, getRevenueData)



export default adminRouter;
