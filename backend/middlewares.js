import jwt from 'jsonwebtoken';
import { asyncHandler } from './utils/asyncHandler.js';

export const isAuthenticated = asyncHandler(async (req, res, next) => {
    const { token } = req.cookies

    if (!token) {
        return res.status(401).json({
            message: 'User not authenticated',
            success: false
        })
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)

    if (!decode) {
        return res.status(401).json({
            message: 'Invalid token',
            success: false
        })
    }

    req._id = decode.userId
    req.user = { userId: decode.userId }
    next()
})


import multer from "multer";


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 //5mb
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
