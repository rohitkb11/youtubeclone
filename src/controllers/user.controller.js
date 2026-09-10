import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import {User} from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import ApiResponse from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
const generateAccessandRefreshtoken = async (userId)=>{
    try {
        const user = await User.findById(userId)        
       const accessToken=  await user.generateAccessToken() 
       const refreshToken =  await  user.generateRefreshToken()
       user.refreshToken = refreshToken
       await user.save({validateBeforeSave: false})
       return { accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500, "something went wrong")

}}
// A controller is a function or component that handles incoming requests and controls the flow of a backend operation, usually by calling the appropriate service and returning a response.
const registerUser = asyncHandler(async (req,res )=>{
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
const existingUser = await User.findOne({
    $or : [{userName},{email}]
})
if(existingUser){
    throw new ApiError(409, "username or email already exists")
}

const avatarLocalPath =  req.files?.avatar[0].path || "";
const userImageLocalPath = req.files?.userImage[0]?.path || "";
// if(!avatarLocalPath){
// throw new ApiError(400,"avatar is needed")
// }

const avatar =  await  uploadOnCloudinary(avatarLocalPath)
const userImage = await uploadOnCloudinary(userImageLocalPath)
// if(!avatar){
//     throw new ApiError(400,"avatar is not uploaded")
// }

const user = await User.create({
    userName,
    email,
    fullName,
    avatar :  avatar?.url|| "",
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

const loginUser = asyncHandler(async (req,res)=>{
    // extract body from req
    // username or email validation
    // find the user 
    // if not reject the request
    // password check
    // access token se validate kro
    // user ko refresh token do

    const {username , email , password} = req.body;
        
    if(!username && !email){
        throw new ApiError(400 , "username or email is required")
    }

  const user = await  User.findOne({
         $or: [{username},{email}]
    })
    console.log(user);
    

    if(!user){
        throw new ApiError(404 , "user not found")
    }

    const isPasswordValid  = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,  " invalid user ")
    }
   const {accessToken , refreshToken}= await generateAccessandRefreshtoken(user._id)
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
   const options={
    httpOnly : true,
    secure : true, 
   }
   return res.status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
    new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "user Logged in successfully"
    )
   )
   

   
     
})

const logoutUser = asyncHandler(async(req,res)=>{
   const loggedOut =  await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken : undefined,

            },
            
        },
        {
            new: true,
        }
    )
     const options={
    httpOnly : true,
    secure : true, 
   }
   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(
    new ApiResponse(200, {},"user logged out successfully")
   )


})

const refereshAccessToken = asyncHandler(async(req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }
   try {
    const decodedToken =  jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
     )
     const user  = await User.findById(decodedToken?._id)
     if(!user){
         throw new ApiError(401,"Invalid refreh token ")
     }
     if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401,"Refresh token is expired or used")
     }
       const options={
     httpOnly : true,
     secure : true, 
    }
     const {accessToken, refreshToken} = await generateAccessandRefreshtoken(user?._id);
    return res.status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
          new ApiResponse(
         200,
         {
             accessToken,refreshToken
         },
         "access token refresh successfully"
     )
     )
   } catch (error) {
    throw new ApiError(401,error?.message|| "invalid refresh token")
   }
})
const changeCurrentPassword = asyncHandler(async (req,res) => {
    const {oldPassword, newPassword} = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,"invalid password")
    }
    user.password = newPassword;
    await user.save({validateBeforeSave : false})
    return res.status(200)
    .json(
        new ApiResponse(200, "password changed successfully")
    )
    
    
})

const updateUserDetails = asyncHandler( async (req, res) => {
    const {fullName, email} = req.body;
    if(!fullName && !email){
        throw new ApiError(400, "all fields are required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set : {
            fullName,
            email : email
        }
    },
    {
        new: true
    }
).select("-password -refreshToken")
return res.status(200)
.json(new ApiResponse(200, user, "account details updated successfully"))
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400,"avatar file is missing")
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)

    if(!avatar?.url){
                throw new ApiError(400,"error while uploading on cloud")
    }

    const user = await User.findByIdAndUpdate(req.user?._id
        ,{
            $set:{avatar: avatar.url}
        },{new:true}
    ).select("-password")
    
    return res.status(200)
    .json(new ApiResponse(200, user, "avatar updated successfully"))
    
})

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400,"coverimage file is missing")
    }

    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage?.url){
                throw new ApiError(400,"error while uploading on cloud")
    }

    const user = await User.findByIdAndUpdate(req.user?._id
        ,{
            $set:{coverImage: coverImage.url}
        },{new:true}
    ).select("-password")
    
    return res.status(200)
    .json(new ApiResponse(200, user, "cover image  updated successfully"))
    
})
 
export {
    registerUser,
    loginUser,
    logoutUser,
    refereshAccessToken
}
