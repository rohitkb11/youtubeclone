import asyncHandler from '../utils/asyncHandler.js'

// A controller is a function or component that handles incoming requests and controls the flow of a backend operation, usually by calling the appropriate service and returning a response.
const registerUser = asyncHandler(async (req,res,next )=>{
res.status(200).json({
    message:'ok'
})
})
export {registerUser}