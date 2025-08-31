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
router.post("/issue", auth, role("issuer"), issueVC);

// Revoke VC (only issuer)
router.post("/revoke", auth, role("issuer"), revokeVC);

// Verify VC (anyone can verify)
router.get("/verify", auth, verifyVC);

// Get VC metadata / on-chain record
router.get("/record/:vchash", auth, getVCRecord);

export default router;
