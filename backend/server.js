const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/mongodb")
dotenv.config();
const connectCloudinary = require("./config/cloudinary")
const adminRoute = require("./routes/AdminRoute")
const doctorRoute = require("./routes/DoctorRoute")
const userRoute = require("./routes/userRoute")
//app config
const app = express();
const port = process.env.PORT || 4000
connectDB()
//middleweres
app.use(express.json());
app.use(cors());
connectCloudinary()

//api end point
app.use('/api/admin',adminRoute);
app.use('/api/doctor',doctorRoute);
app.use('/api/user',userRoute)
//localhost 4000/api/admin/add-doctor
app.get('/',(req,res)=>{
    res.send("Api working great")

})

app.listen(port,()=>{
    console.log(`server is running on ${port}`)
})