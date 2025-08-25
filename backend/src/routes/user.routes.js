import { Router } from "express";
import { registerUser, walletNonce,walletVerify,loginUser,logout } from "../controllers/user.controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();


router.post("/register", registerUser);
router.get("/nonce", authenticate, walletNonce);
router.post("/verify", authenticate, walletVerify);
router.post("/login", loginUser);
router.post("/logout", logout);

export default router;