import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import audit_logsModels from "../models/audit_logs.models.js";

const generateAccessandRefreshtoken=async(userId)=>{
try {
    const user=await User.findById(userId);
    const accessToken=user.generateAccessToken();
    const refreshToken=generateRefreshToken();
    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false});
    return {accessToken,refreshToken};
} catch (error) {
     throw new ApiError(
      500,
      "Something went error while generating refresh and access token."
    );
}
}

const registerUser=async(req,res)=>{
try {
        const {username,email,password,role}=req.body;
         if([username, email, password].some(field => field?.trim() === "")) {
        throw new ApiError(400,"All fields are required");
       }
       const existedUser=await User.findOne({
        $or:[{username:username},{email:email}]
    
       });
        if (existedUser) {
        throw new ApiError(409, "User already exists with this username or email");
      }
      const userObject={
        username,
        email,
        password,
        role:role || "user"
      };
      const user=await User.create(userObject);
        const createdUser = await User.findById(user._id).select(
        "-password  -refreshToken"
      ); // Exclude password and refreshToken from the response
    
      if (!createdUser) {
        throw new ApiError(500, "User creation failed");
      }
    
      await audit_logsModels.create({action:"User_Registration",actor:user._id,metadata:{email,role:user.role}})
        return new ApiResponse(res, 201, "User registered successfully", {
        user: createdUser,
      });
      
} catch (error) {
    throw new ApiError(400,error.message,"User registeration failed");
}
}

const loginUser=async(req,res)=>{
    try {
         const { email, username, password } = req.body;
           if (!(email || username)) {
    throw new ApiError(400, "Email or username is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user=await User.findOne({
    $or:[{email,username}]
  })

 if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  const passwordFind = await user.isPasswordCorrect(password);
  if (!passwordFind) {
    throw new ApiError(404, "Wrong Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

    const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
    //cookie -->
  // IMPORTANT STEPS SO THAT ONLY SERVER CAN MODIFY IT
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          role:user.role,
          accessToken,
          refreshToken, //because of data
        },
        "User logges in successfully"
      )
    );


    } catch (error) {
      
        throw new ApiError(400,error.message,"Login error");
    }
}


const logout = async (req, res) => {
  // req.user._id; // get the user id from the request object
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null, // set the refresh token to null
      },
    },
    { new: true } // return the updated user
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
  // clear the access token cookie
  // clear the refresh token cookie
  // return success response
};

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.cookies || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Unauthorized request");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is not valid");
  }
  const options = {
    httpOnly: true,
    secure: true,
  };
  // Generate new access and refresh tokens
  const { accessToken, newrefreshToken } = await generateAccessandRefreshtoken(
    user._id
  );
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newrefreshToken },
        "Tokens refreshed successfully"
      )
    );
};

export {
    refreshAccessToken,
    registerUser,
    loginUser,
    logout
}