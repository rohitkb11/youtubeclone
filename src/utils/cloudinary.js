import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from 'fs';

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
    return response
    
    } catch (err) {
        fs.unlink(localFilePath) // remove the locally saved temporary file as the file upload got failed
        return null
    }
    
}
export {uploadOnCloudinary}
