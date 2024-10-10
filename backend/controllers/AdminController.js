const validator = require("validator")
const bcrypt = require("bcrypt")
const cloudinary = require("cloudinary").v2;
const doctorModel = require("../models/doctorModel")
const jwt = require("jsonwebtoken")
const appointmentModel = require("../models/appointmentModel");
const userModel = require("../models/userModel");


// API for adding Doctor
const addDoctor = async (req, res) => {

    try {

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address:JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        res.json({ success: true, message: 'Doctor Added' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//api for admin login

const loginAdmin = async(req,res)=>{
    try{
        const { email, password } = req.body;
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            return res.status(200).json({
                success:true,
                token
            })
        }else{
            return res.status(401).json({
                success:false,
                message:"Invalid credentials"

            })
        }
    }
    catch(error){
        console.log(error)
        res.json({ success: false, message: error.message })
    

    }

}

//Api to get all doctors list for admin panel

const allDoctors = async(req,res)=>{
    try {
        const doctors = await doctorModel.find({}).select("-password")
        return res.status(200).json({
            success:true,
            doctors
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
        
    }
}

//API to get all appointments kist

const appointmentAdmin = async(req,res) =>{
    try {
        const appointments = await appointmentModel.find({})
        return res.status(200).json({
            success:true,
            appointments
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
        
    }
}
//Api for appointment canceellation
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId} = req.body;
        
        // Fetching the appointment data
        const appointmentData = await appointmentModel.findById(appointmentId);
        
        if (!appointmentData) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        

        // Mark appointment as cancelled
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // Releasing the doctor's slots
        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);

        if (!doctorData) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        let slots_booked = doctorData.slots_booked;

        // Check if the slotDate exists in the doctor's booked slots
        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);

            // Update the doctor's slots
            await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        }

        return res.status(200).json({
            success: true,
            message: "Appointment cancelled"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
//API to get dashboard data for admin panel
const AdminDashboard = async(req,res) =>{
    try {
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors:doctors.length,
            appointments:appointments.length,
            petients:users.length,
            latestAppointments:appointments.reverse().slice(0,5)
        }
        return res.status(200).json({
            success:true,
            dashData
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


module.exports = { addDoctor,loginAdmin,allDoctors,appointmentAdmin,appointmentCancel,AdminDashboard };
