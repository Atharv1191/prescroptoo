// routes/userRoute.js
const express = require("express");
const { registerUser, loginUser, getProfile,updateProfile,bookAppointment,listAppointment,CancelAppointment,paymentRazorpay,verifyRazorpay } = require("../controllers/UserController");  // Ensure the path and names are correct
const  authUser  = require('../middeleweres/AuthUser');  // Ensure middleware is correctly imported
const upload = require("../middeleweres/multer");

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);


router.get('/get-profile',authUser,getProfile);
router.post('/update-profile',upload.single('image'),authUser,updateProfile)

router.post('/book-appointment',authUser,bookAppointment)
router.get('/appointments',authUser,listAppointment)
router.post('/cancel-appointment',authUser,CancelAppointment)
router.post('/payment-razorpay',authUser,paymentRazorpay)
router.post('/verifyRazorpay',authUser,verifyRazorpay)
module.exports = router;
