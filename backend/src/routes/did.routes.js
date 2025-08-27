import express from "express";
import { registerDID,revoke,getUser } from "../controllers/did.controllers";
const router = express.Router();
import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";

router.post("/register", auth, role("issuer"), registerDID);
router.post("/revoke", auth, role("issuer"), revoke);
router.get("/user", auth, getUser);

export default router;