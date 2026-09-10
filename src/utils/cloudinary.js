import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';
import asyncHandler from "./asyncHandler";
import ApiError from "./ApiError";

cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME , 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // if localfilepath is there upload the file on cloudinary
        const response = cloudinary.uploader.upload(localFilePath,{
            resource_type: 'auto'
    })   
    console.log("file uploaded succesfully" , (await response).url);
    fs.unlink(localFilePath)
    return response
    
    } catch (err) {
        fs.unlink(localFilePath) // remove the locally saved temporary file as the file upload got failed
        return null
    }
    
}

const deleteFromCloudinary = async (imagePublicId) => {
   try {
     const response = cloudinary.uploader.destroy(imagePublicId,{invalidate:true});
     return response
   } catch (error) {
    throw new ApiError(400, "deletion was not possigle")
   }
}
export {uploadOnCloudinary,deleteFromCloudinary}
