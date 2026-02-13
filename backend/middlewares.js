import jwt from 'jsonwebtoken';

export const isAuthenticated = async(req, res, next)=>{
    try {
        const {token} = req.cookies

        if(!token){
            res.status(400).json({
                message:'User not authenticated',
                success:false
            })   
            return
        }

        const decode = jwt.verify(token,process.env.JWT_SECRET_KEY)

        if(!decode){
            res.status(400).json({
                message:'User not authenticated',
                success:false
            })   
            return
        }

        req._id = decode.userId
        next()
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Interal server error',
            success:false
        })   
    }
}


import multer from "multer";


const upload = multer({
    storage:multer.memoryStorage(),
    limits:{
        fileSize:5*1024*1024 //5mb
    }
})

export default upload



export const globalErrorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        success: false
    });
};
