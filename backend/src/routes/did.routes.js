import express from "express";
import { registerDID,revoke,getUser } from "../controllers/did.controllers.js";
const router = express.Router();
import {verifyJWT} from "../middleware/auth.middleware.js";
import {authorizeRoles} from "../middleware/premission.middleware.js";

router.post("/register", verifyJWT, authorizeRoles("issuer"), registerDID);
router.post("/revoke", verifyJWT, authorizeRoles("issuer"), revoke);
router.get("/user", verifyJWT, getUser);

export default router;