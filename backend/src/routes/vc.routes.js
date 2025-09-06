import express from "express";
import {
  issueVC,
  revokeVC,
  verifyVC,
  getVCRecord
} from "../controllers/vc.controllers.js";
import {verifyJWT} from "../middleware/auth.middleware.js";
import {authorizeRoles} from "../middleware/premission.middleware.js";


const router = express.Router();

// Issue VC (only issuer)
router.post("/issue",verifyJWT, authorizeRoles("issuer"), issueVC);

// Revoke VC (only issuer)
router.post("/revoke", verifyJWT, authorizeRoles("issuer"), revokeVC);

// Verify VC (anyone can verify)
router.get("/verify", verifyJWT, verifyVC);

// Get VC metadata / on-chain record
router.get("/record/:vchash", verifyJWT, getVCRecord);

export default router;
