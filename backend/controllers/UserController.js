
const validator = require("validator")
const bcrypt = require ("bcrypt")
const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const cloudinary = require("cloudinary").v2;
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const razorpay = require("razorpay")
// API to register user

const registerUser = async(req,res)=>{
    try{
        const {name,email,password} = req.body
        if(!name || !email|| !password){
            return res.status(400).json({
                success:false,
                message:"missing details"
            })
        }
        if(!validator.isEmail(email)){
            return res.status(400).json({
                success:false,
                message:"Enter a valid email"
            })
        }
        //validating strong password
        if(password.length < 8){
            return res.status(400).json({
                success:false,
                message:"Enter a strong password"
            })
        }
        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const userData = {
            name,email,password:hashedPassword
        }
        const newUser = new userModel(userData)
        const user = await newUser.save()
        
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

     return res.status(200).json(
        { success:true,
            token

})
        
    }
    catch(error){
        console.log(error);
        res.json({
            success:false,
            message:error.message
        })

    }
}

//api for login user
const loginUser = async(req,res)=>{
    try{
        const {email,password} = req.body;
        const user = await userModel.findOne({email})
        if(!user){
            res.json({
                success:false,
                message:"User does not exist"
            })
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(isMatch){
            const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
            return res.status(200).json({
                success:true,
                token
            })
        } else{
            return res.status(400).json({
                success:false,
                message:"Invalid credentials"
            })
        }
    }
    catch(error){
        console.log(error);
        res.json({
            success:false,
            message:error.message
        })
    }
}
//api to get user profile data
const getProfile = async(req,res)=>{
    try {
        const {userId} = req.body;
        const userData = await userModel.findById(userId).select('-password')
        return res.status(200).json({
            success:true,
            userData
        })
    } catch (error) {
        console.log(error);
        res.json({
            success:false,
            message:error.message
        })
    }
}
//API to update user profile

const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;

        // Validate required fields
        if (!name || !phone || !dob || !gender) {
            return res.status(400).json({
                success: false,
                message: "Missing required data (name, phone, dob, gender)"
            });
        }

        // Parse address if provided
        let parsedAddress;
        try {
            parsedAddress = address ? JSON.parse(address) : undefined;
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: "Invalid address format"
            });
        }

        // Update profile without image first
        await userModel.findByIdAndUpdate(userId, {
            name,
            phone,
            address: parsedAddress,
            dob,
            gender
        });

        // Check if image is provided for upload
        if (imageFile) {
            // Upload image to Cloudinary
            try {
                const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                    resource_type: 'image'
                });

                const imageUrl = imageUpload.secure_url;

                // Update user profile with the image URL
                await userModel.findByIdAndUpdate(userId, { image: imageUrl });
            } catch (uploadError) {
                return res.status(500).json({
                    success: false,
                    message: "Image upload failed",
                    error: uploadError.message
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
//Api to book appointment
const bookAppointment = async(req,res)=>{
    try {
        const {userId,docId,slotDate,slotTime} = req.body;
        const docData = await doctorModel.findById(docId).select('-password')
        if(!docData.available){
            return res.status(500).json({
                success:false,
                message:"Doctor not Available"
            })
        }
        let slots_booked = docData.slots_booked

        //checking for slots availability
        if(slots_booked[slotDate]){
            if(slots_booked[slotDate].includes(slotTime)){
                return res.status(400).json({
                    success:false,
                    message:"Slot not available"
                })
            }else{
                slots_booked[slotDate].push(slotTime)
            }
        }else{
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }
        const userData = await userModel.findById(userId).select('-password')
        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount:docData.fees,
            slotTime,
            slotDate,
            date:Date.now()
        
        }
        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        //save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId,(slots_booked))
        return res.status(200).json({
            success:true,
            message:"Appointment booked successfully"
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
//API to get user for frontend my-appointment page

const listAppointment = async(req,res) =>{
    try {
       const {userId} = req.body;
       const  appointments = await appointmentModel.find({userId})
       return res.status(200).json({
        success:true,
        appointments
       })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
//Api for cancel appointment

const CancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body;
        
        // Fetching the appointment data
        const appointmentData = await appointmentModel.findById(appointmentId);
        
        if (!appointmentData) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Verify appointment user
        if (appointmentData.userId.toString() !== userId) {
            return res.status(400).json({
                success: false,
                message: "Unauthorized action"
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
const razorpayInstance = new razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
})

//API to make payment of appointment using razorpay

const paymentRazorpay = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
      const { razorpay_order_id } = req.body;
  
      // Check if the order ID is provided
      if (!razorpay_order_id) {
        return res.status(400).json({
          success: false,
          message: "Invalid Request: Missing Razorpay order ID",
        });
      }
  
      // Fetch the order information from Razorpay
      const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
  
      // Check if the payment is successful
      if (orderInfo.status === 'paid') {
        await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
  
        return res.status(200).json({
          success: true,
          message: "Payment Successful",
        });
      } else {
        console.log("Payment failed for order:", razorpay_order_id);
        return res.status(400).json({
          success: false,
          message: "Payment Failed",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
  
module.exports = {registerUser,loginUser,getProfile,updateProfile,bookAppointment,listAppointment,CancelAppointment,paymentRazorpay,verifyRazorpay}
