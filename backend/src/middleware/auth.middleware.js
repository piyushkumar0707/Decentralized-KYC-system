import ApiError from "../utility/ApiError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const verifyJWT=async (req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ","");
        if(!token){
            throw new ApiError(401,"Unauthorized Acsess");

        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(401,"Unauthorized user");
        }
            req.user=user;
            next();

    } catch (error) {
        throw new ApiError(401,error?.message,"Unauthorized action")
    }
}