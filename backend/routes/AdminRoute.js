const express = require("express");
const { addDoctor, loginAdmin, allDoctors, appointmentAdmin,appointmentCancel,AdminDashboard } = require("../controllers/AdminController.js");
const upload = require("../middeleweres/multer");
const authAdmin = require("../middeleweres/authAdmin");
const { ChangeAvailability } = require("../controllers/doctorController")
const router = express.Router();

router.post('/add-doctor', authAdmin, upload.single('image'), addDoctor);
router.post('/login', loginAdmin)
router.post('/all-doctors', authAdmin, allDoctors)
router.post("/change-availibility", authAdmin, ChangeAvailability)
router.get('/appointments',authAdmin,appointmentAdmin)
router.post('/cancel-appointment',authAdmin,appointmentCancel)
router.get('/dashboard',authAdmin,AdminDashboard)
module.exports = router;