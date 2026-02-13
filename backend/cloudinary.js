import { v2 as cloudinary } from 'cloudinary'
import getDataUri from './utils/dataUri.js'
import dotenv from 'dotenv'

dotenv.config({})

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

export default cloudinary

export function deleteItemFromCloudinary(itemUrl) {
    const publicId = itemUrl.slice(itemUrl.lastIndexOf('/') + 1, itemUrl.length - 4)
    if (publicId) {
        cloudinary.uploader.destroy(publicId)
    }
}


export const uploadImageOnCloundinary = async (file) => {
    try {
        const dataUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(dataUri);

        return cloudResponse.secure_url
    } catch (err) {
        throw new Error('Error occured while uploading file on cloudinary')
    }
}