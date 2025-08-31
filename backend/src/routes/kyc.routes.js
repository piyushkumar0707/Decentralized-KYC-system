import express from "express";
import {
  submitKYC,
  list,
  getKycHistory,
  approveKYC,
  rejectKYC

} from "../controllers/kyc.controllers.js";
import {verifyJWT} from "../middleware/auth.middleware.js";
import {authorizeRoles} from "../middleware/premission.middleware.js";

const router = express.Router();

// Submit KYC (by user)
router.post("/submit", verifyJWT, submitKYC);

// List pending KYC requests (user sees their own, issuer sees all)
router.get("/pending", verifyJWT, list);

// Get KYC history by DID (issuer or user)
router.get("/history/:did", verifyJWT, getKycHistory);

// Approve KYC (only issuer)
router.post("/approve/:id", verifyJWT, authorizeRoles("issuer"), approveKYC);

// Reject KYC (only issuer)
router.post("/reject/:id", verifyJWT, authorizeRoles("issuer"), rejectKYC);







export default router;
