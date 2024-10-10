const jwt = require("jsonwebtoken")

//admin authentication middelewere

const authUser = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.status(403).json({
                success: false,
                message: "Not authorized login again"
            })
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        
        req.body.userId = token_decode.id 
        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}
module.exports = authUser