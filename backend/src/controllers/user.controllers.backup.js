import ApiError from "../utility/ApiError.js";
import  User  from "../models/user.models.js";
import ApiResponse from "../utility/ApiResponse.js";
import jwt from 'jsonwebtoken';
import audit_logsModels from "../models/audit_logs.models.js";
import crypto from 'crypto';
import { ethers} from "ethers";
import { verifyMessage } from "../utility/ethSignatureUtils.js";
import { isOnChainIssuer } from "../Services/blockChain.services.js";

const generateAccessandRefreshtoken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

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

// Wallet Login - Simplified for demo
const walletNonce = async (req, res) => {
  try {
    const {address} = req.body;
    if (!address) {
      return res.status(400).json(new ApiResponse(400, null, "Address is required"));
    }
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json(new ApiResponse(400, null, "Invalid wallet address"));
    }

    // Generate nonce without database for now (temporary fix)
    const nonce = crypto.randomBytes(32).toString("hex");
    
    // Store nonce in memory temporarily (not recommended for production)
    if (!global.userNonces) {
      global.userNonces = {};
    }
    global.userNonces[address.toLowerCase()] = nonce;

    return res.status(200).json(new ApiResponse(200, { nonce }, "Nonce generated"));
  } catch (error) {
    console.error("Nonce generation error:", error);
    return res.status(500).json(new ApiResponse(500, null, "Failed to generate nonce: " + error.message));
  }
};

// Wallet Signature Verification - Simplified for demo
const walletVerify = async (req, res) => {
  try {
    const { address, signature} = req.body;
    
    if (!address || !signature) {
      return res.status(400).json(new ApiResponse(400, null, "Address and signature are required"));
    }

    // Get nonce from memory
    if (!global.userNonces || !global.userNonces[address.toLowerCase()]) {
      return res.status(404).json(new ApiResponse(404, null, "Nonce not found. Please request a new nonce."));
    }
    
    const nonce = global.userNonces[address.toLowerCase()];  // Add these console logs to debug the values
//   console.log("--- DEBUGGING SIGNATURE VERIFICATION ---");
//   console.log("Nonce from DB:", user.nonce);
//   console.log("Signature from Request:", signature);
//   console.log("Address from Request:", address);
//   console.log("---------------------------------------");

  let recoveredAddress;
  try {
    recoveredAddress = verifyMessage(user.nonce, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new ApiError(401, "Invalid signature");
    }
  } catch (error) {
    console.error("Verification failed:", error);
    throw new ApiError(401, "Invalid signature");
  }
// if (address === "0x1234567890abcdef1234567890abcdef12345678") {
//   return res.json({ success: true, role: "issuer (mock)" });
// } else {
//   return res.status(401).json({ success: false, message: "Not issuer" });
// } only for testing

try {
    const isissuer=await isOnChainIssuer(address);
    if(isissuer) user.role='issuer';
  } catch (error) {
    throw new ApiError(403, "You are not authorized");
  }
  user.wallet = address.toLowerCase();
  user.nonce = undefined;
  await user.save();

    const { accessToken, refreshToken } = await generateAccessandRefreshtoken(user._id);
    const userSafe = await User.findById(user._id).select("-password -refreshToken");

    const options = { httpOnly: true, secure: true };

   await audit_logsModels.create({
    user: user._id,
    action: "wallet_verify",
    status: "success",
    timestamp: new Date()
  });
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { user: userSafe, role: user.role, accessToken, refreshToken ,address}, "Login successful"));


};
// View Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(new ApiResponse(200, user, "User profile fetched"));
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export {
  refreshAccessToken,
  registerUser,
  loginUser,
  logout,
  walletNonce,
  walletVerify,
  getUserProfile
};
