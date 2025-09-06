import { Router } from "express";
import { registerUser, walletNonce,walletVerify,loginUser,logout } from "../controllers/user.controllers.js";
import {verifyJWT} from "../middleware/auth.middleware.js";

const router = Router();


router.post("/register", registerUser);
router.post("/nonce", walletNonce);
router.post("/verify", walletVerify);
router.post("/login", loginUser);
router.post("/logout", logout);

export default router;