// Just to verify user hai ya nahi ....
// vo logged in hai ya nahi for eg user will be able to like post only if user is logged in so isliye ye middleware
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"

//we are not using res in this code so instead of res we have written _
export const verifyJWT=asyncHandler(async(req,_,next)=>{
    try {
        const token =req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }

        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid access Token")
        }

        req.user=user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid access")
    }
})