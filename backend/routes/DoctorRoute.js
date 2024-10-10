const express = require("express")
const { doctorList,loginDoctor,appointmentsDoctor,appointmentComplete,appointmentCancel,doctorDashboard,doctorProfile,updateDoctorProfile } = require("../controllers/doctorController")
const authDoctor = require("../middeleweres/AuthDoctor")

const router = express.Router()

router.get('/list',doctorList)
router.post('/login',loginDoctor)
router.get('/appointments',authDoctor,appointmentsDoctor)
router.post('/complete-appointment',authDoctor,appointmentComplete);
router.post('/cancel-appointment',authDoctor,appointmentCancel)
router.get('/dashboard',authDoctor,doctorDashboard)
router.get('/profile',authDoctor,doctorProfile)
router.post('/update-profile',authDoctor,updateDoctorProfile)
module.exports = router;