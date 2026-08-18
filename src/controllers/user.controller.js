import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import {User} from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import ApiResponse from '../utils/ApiResponse.js'
// A controller is a function or component that handles incoming requests and controls the flow of a backend operation, usually by calling the appropriate service and returning a response.
const registerUser = asyncHandler(async (req,res,next )=>{
// get user details from frontend
// validation - not empty
// check if user already exists : check with username and email
// check for images and avatar
// if available upload them to cloudinary , avatar
// create user object - create entry in db 
// remove password and refresh token field from response
// check for user creation, if response is null or not 
// if yes return response
const {userName, fullName , email,password }= req.body
console.log(email);

// checking empty fields
if(
[userName,fullName,email,password].some((field)=> (field?.trim()==='') )

){
    throw new ApiError(400,'all fields are compulsory')
}

// checking if user exists
const existingUser = User.findOne({
    $or : [{userName},{fullName}]
})
if(existingUser){
    throw new ApiError(409, "username or email already exists")
}

const avatarLocalPath = req.files?.avatar[0]?.path
const userImageLocalPath = req.files?.userImage[0]?.path
if(!avatarLocalPath){
throw new ApiError(400,"avatar is needed")
}

const avatar =  await  uploadOnCloudinary(avatarLocalPath)
const userImage = await uploadOnCloudinary(userImageLocalPath)
if(!avatar){
    throw new ApiError(400,"avatar is not uploaded")
}

const user = await User.create({
    userName,
    email,
    fullName,
    avatar :  avatar.url,
    userImage: userImage?.url || "",
    password, 
})

const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken"
)
if(!createdUser){
    throw new ApiError(500,"user could not be registered on database")
}

return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered succesfully")
)

}) 
export {registerUser}