import list from "../controllers/audit.controllers.js";
import express from "express";
import {verifyJWT} from "../middleware/auth.middleware.js";
import {authorizeRoles} from "../middleware/premission.middleware.js";

const router = express.Router();

router.get("/list", verifyJWT, authorizeRoles("admin"), list);

export default router;
