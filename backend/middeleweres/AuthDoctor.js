const jwt = require("jsonwebtoken")

//doctor authentication middelewere

const authDoctor = async (req, res, next) => {
    try {
        const { dtoken } = req.headers;
        if (!dtoken) {
            return res.status(403).json({
                success: false,
                message: "Not authorized login again"
            })
        }
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
        
        req.body.docId = token_decode.id 
        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}
module.exports = authDoctor