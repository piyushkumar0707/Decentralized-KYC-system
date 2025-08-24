import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';
import audit_logsModels from "../models/audit_logs.models.js";
import crypto from 'crypto';
import { ethers } from "ethers";


const generateAccessandRefreshtoken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating access and refresh token.");
  }
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if ([username, email, password].some(field => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    if (existedUser) {
      throw new ApiError(409, "User already exists");
    }

    const user = await User.create({
      username,
      email,
      password,
      role: role || "user"
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    await audit_logsModels.create({
      action: "User_Registration",
      actor: user._id,
      metadata: { email, role: user.role }
    });

    return new ApiResponse(res, 201, "User registered successfully", { user: createdUser });

  } catch (error) {
    throw new ApiError(400, error.message, "User registration failed");
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!(email || username) || !password) {
      throw new ApiError(400, "Email/username and password are required");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) throw new ApiError(404, "User not found");

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) throw new ApiError(401, "Invalid credentials");

    const { accessToken, refreshToken } = await generateAccessandRefreshtoken(user._id);
    const userSafe = await User.findById(user._id).select("-password -refreshToken");

    const options = { httpOnly: true, secure: true };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { user: userSafe, role: user.role, accessToken, refreshToken }, "Login successful"));

  } catch (error) {
    throw new ApiError(400, error.message, "Login error");
  }
};

const logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: null } }, { new: true });

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "Logout successful"));
};

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(400, "No refresh token provided");

  const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decoded?._id);
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshtoken(user._id);
  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { accessToken, refreshToken }, "Tokens refreshed"));
};

// Wallet Login
const walletNonce = async (req, res) => {
  const { address } = req.body;
  if (!address) throw new ApiError(400, "Wallet address is required");

  let user = await User.findOne({ wallet: address.toLowerCase() });
  if (!user) {
    user = await User.create({ wallet: address.toLowerCase() });
  }

  const nonce = crypto.randomBytes(32).toString("hex");
  user.nonce = nonce;
  await user.save();

  return res.status(200).json(new ApiResponse(200, { nonce }, "Nonce generated"));
};

// Wallet Signature Verification
const walletVerify = async (req, res) => {
  const { address, signature } = req.body;
  if (!address || !signature) throw new ApiError(400, "Address and signature are required");

  const user = await User.findOne({ wallet: address.toLowerCase() });
  if (!user) throw new ApiError(404, "User not found");

  const recoveredAddress = ethers.utils.verifyMessage(user.nonce, signature);
  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    throw new ApiError(401, "Invalid signature");
  }

  if(expectedRole==='issuer'){
    const ok=await isOwner(user._id, req.user._id);
    if(!ok) throw new ApiError(403, "You are not authorized");
    user.role='issuer';
  }

  if(expectedRole==='verifier'){
    const ok=await isOwner(user._id, req.user._id);
    if(!ok) throw new ApiError(403, "You are not authorized");
    user.role='verifier';
  }

  user.nonce=undefined;
  await user.save();
  const { accessToken, refreshToken } = await generateAccessandRefreshtoken(user._id);
  return res.status(200).json(new ApiResponse(200, { address, accessToken, refreshToken }, "Wallet verified"));
};

export {
  refreshAccessToken,
  registerUser,
  loginUser,
  logout,
  walletNonce,
  walletVerify
};
