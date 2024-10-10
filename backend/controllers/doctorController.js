
const doctorModel = require('../models/doctorModel')
const appointmentModel = require("../models/appointmentModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const ChangeAvailability = async(req,res)=>{
    try {
        const {docId} = req.body
        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{available: !docData.available})
        res.json({success:true,message:"Availability changed"})
    } catch (error) {
        console.log(error)
        res.json({
            success:false,
            message:error.message
        })
    }
}
const doctorList = async(req,res)=>{
    try {
        const doctors = await doctorModel.find({}).select(['-password','-email'])
        return res.status(200).json({
            success:true,
            doctors
        })
    } catch (error) {
        console.log(error)
        res.json({
            success:false,
            message:error.message
        })
        
    }
}
//API for doctor login
const loginDoctor = async(req,res)=>{
    try {
        const {email,password} = req.body;
        const doctor = await doctorModel.findOne({email})
        if(!doctor){
            return res.status(400).json({
                success:false,
                message:"Invalid credentials"
            })
        }
        const isMatch = await bcrypt.compare(password,doctor.password)
        if(isMatch){
            const token = jwt.sign({id:doctor._id},process.env.JWT_SECRET)
            return res.status(200).json({
                success:true,
                token
            })
        }else{
            return res.status(400).json({
                success:false,
                message:"Invalid credentials"
            })
        }
    } catch (error) {
        console.log(error)
        res.json({
            success:false,
            message:error.message
        })
        
        
    }
}
//api to get doctor appointments for doctor panel
const appointmentsDoctor = async(req,res) =>{
    try {
        const {docId} = req.body;
        const appointments = await appointmentModel.find({docId})
        return res.status(200).json({
            success:true,
            appointments
        })
    } catch (error) {
        console.log(error)
        res.json({
            success:false,
            message:error.message
        })
    }
}
//API to mark appointment completed for doctor panel

const appointmentComplete = async(req,res)=>{
    try{
const {docId,appointmentId} = req.body;
const appointmentData = await appointmentModel.findById(appointmentId)
if(appointmentData && appointmentData.docId === docId){
    await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted: true})
    return res.status(200).json({
        success:true,
        message:"Appointment Completed"
    })
} else{
    return res.status(500).json({
        success:fasle,
        message:"Mark failed"
    })
}
    } catch(error){
        console.log(error)
        res.json({
            success:false,
            message:error.message
        })
    }
}
//api to cancel appointment from admin panel
const appointmentCancel = async(req,res)=>{
    try{
const {docId,appointmentId} = req.body;
const appointmentData = await appointmentModel.findById(appointmentId)
if(appointmentData && appointmentData.docId === docId){
    await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})
    return res.status(200).json({
        success:true,
        message:"Appointment Cancelled"
    })
} else{
    return res.status(500).json({
        success:fasle,
        message:"Cancellation failed"
    })
}
    } catch(error){
        console.log(error)
        res.json({
            success:false,
            message:error.message
        })
    }

}
//API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req.body;

        // Fetching the appointments for the given doctor ID
        const appointments = await appointmentModel.find({ docId });

        // Calculate earnings
        let earnings = 0;
        appointments.forEach((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount;
            }
        });

        // Collect unique patient IDs
        let patients = [];
        appointments.forEach((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId);
            }
        });

        // Prepare dashboard data
        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.slice().reverse().slice(0, 5), // Reverse a copy to avoid mutating original array
        };

        // Sending successful response
        return res.status(200).json({
            success: true,
            dashData,
        });
    } catch (error) {
        console.log(error);
        // Sending error response
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
//API to get doctor profile for doctor panel

const doctorProfile = async (req, res) => {
    try {
        const { docId } = req.body;

        // Fetch the doctor profile, excluding the password field
        const profileData = await doctorModel.findById(docId).select('-password');
        
        // Return the profile data if successful
        return res.status(200).json({
            success: true,
            profileData,
        });
    } catch (error) {
        // Return a 500 error if something goes wrong
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//API to update doctor profile data from Doctor Panel
const updateDoctorProfile = async(req,res)=>{
    try {
        const {docId,fees,address,available} = req.body;
        await doctorModel.findByIdAndUpdate(docId,{fees,address,available})
        return res.status(200).json({
            success:true,
            message:"Profile Updated"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
module.exports ={ChangeAvailability,doctorList,loginDoctor,appointmentsDoctor,appointmentCancel,appointmentComplete,doctorDashboard,doctorProfile,updateDoctorProfile}