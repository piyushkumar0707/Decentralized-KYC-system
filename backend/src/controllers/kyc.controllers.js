import fs from 'fs';
import KYCrequestsModels from '../models/KYCrequests.models.js';
import audit_logsModels from '../models/audit_logs.models.js';
import { uploadFileBufferToPinata } from '../middleware/ipfs.middleware.js';
import {keyID } from '../config/KMS.js';
import { encryptionBuffer } from '../Services/encryptionService.js';
import ApiError from '../utility/ApiError.js';
import ApiResponse from '../utility/ApiResponse.js';
import User from '../models/user.models.js';
import {issueVC} from './vc.controllers.js';
// Submit KYC
const submitKYC = async (req, res) => {
  try {
    const { did, documentType } = req.body;
    if (!did) throw new ApiError(400, "DID is required");
    if (!req.file) throw new ApiError(400, "File is required");


    const buffer = fs.readFileSync(req.file.path);

    if (!buffer) throw new ApiError(500, "Failed to read uploaded file");
    // Check if user already has a pending KYC
    const existing = await KYCrequestsModels.findOne({
      user: req.user.id,
      status: 'pending'
    });
    if (existing) {
      return res.status(400).json(new ApiResponse(400, null, "Pending KYC request already exists"));
    }
    // Check if user already has an approved KYC for the same document type
    const approved = await KYCrequestsModels.findOne({
      user: req.user.id,
      documentType,
      status: 'approved'
    });
    if (approved) {
      return res.status(400).json(new ApiResponse(400, null, `KYC already approved for document type: ${documentType}`));
    }


    // Encrypt and wrap AES key
    const { cipherText, meta } = await encryptionBuffer(buffer);
    const ipfsHash = await uploadFileBufferToPinata(cipherText);

    fs.unlinkSync(req.file.path); // Clean up local file

    const kycRequest = await KYCrequestsModels.create({
      user: req.user.id,
      did: req.body.did,
      documentType,
      documentCID: ipfsHash,
      encryption: {
        algo: meta.algo,
        keywrapped: meta.keyWrapped,
        iv: meta.iv.toString('base64'),
        tag: meta.tag.toString('base64'),
        keyID: keyID
      }
    });

    await audit_logsModels.create({
      action: "KYC_Request_Submitted",
      actor: req.user.id,
      metadata: {
        did,
        documentType,
        documentCID: ipfsHash
      }
    });

    return res.json(new ApiResponse(201, "KYC request submitted successfully", { kycRequest }));
  } catch (error) {
    console.error("Error submitting KYC:", error);

    return res.status(500).json(new ApiResponse(500, null, "Internal Server Error", {
      error: error.message
    }));
  }
};

// View Pending KYC Requests (for issuer or user)
const list = async (req, res) => {
  try {
    const kycRequests = await KYCrequestsModels.find({
      user: req.user.id,
      status: "pending"
    });

    return res.json(new ApiResponse( 200, "Pending KYC requests retrieved", {
      kycRequests
    }));
  } catch (error) {
    console.error("Error fetching pending KYC requests:", error);
    return res.status(500).json(new ApiResponse(500, null, "Internal Server Error", {
      error: error.message
    }));
  }
};

// Get all KYC history for a given user (by DID)
const getKycHistory = async (req, res) => {
  try {
    const { did } = req.params; // DID will be passed in params

    // Find user by DID
    const user = await User.findOne({ did });
    if (!user) {
      return res.status(404).json({ message: "User with this DID not found" });
    }

    // Find all KYC records for that DID
    const kycRecords = await KYCrequestsModels.find({ did }).sort({ createdAt: -1 }); // latest first

    res.status(200).json(new ApiResponse(200, {
         message: "KYC history fetched successfully",
      total: kycRecords.length,
      history: kycRecords
    }));
  } catch (error) {
    console.error("Error fetching KYC history:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const approveKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

      const kyc = await KYCrequestsModels.findById(id);
    if (!kyc) throw new ApiError(404, "KYC request not found");

    if (kyc.status === "approved") return res.status(200).json(new ApiResponse(200, { kyc }, "Already approved"));

    // mark reviewed
    kyc.status = "approved";
    kyc.reviewedBy = req.user.id;
    kyc.remarks = remarks;
    await kyc.save();

    await audit_logsModels.create({
      action: "KYC_APPROVED",
      actor: req.user.id,
      metadata: { id, status: "approved" }
    });

    const vc = await issueVC({ kyc, issuerUser: req.user });


    return res.json(new ApiResponse(200, "KYC approved", { kyc,vc }));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Internal Server Error", { error: error.message }));
  }
};

// Reject KYC
const rejectKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    if (req.user.role !== "issuer") throw new ApiError(403, "Only issuer can reject KYC");

    const kyc = await KYCrequestsModels.findById(id);
    if (!kyc) throw new ApiError(404, "KYC request not found");

    if (kyc.status === "rejected") return res.status(200).json(new ApiResponse(200, { kyc }, "Already rejected"));

    kyc.status = "rejected";
    kyc.reviewedBy = req.user.id;
    kyc.remarks = remarks;
    await kyc.save();

    await audit_logsModels.create({
      action: "KYC_REJECTED",
      actor: req.user.id,
      metadata: { id, status: "rejected" }
    });

    return res.json(new ApiResponse(res, 200, "KYC rejected", { kyc }));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Internal Server Error", { error: error.message }));
  }
};

export {
  submitKYC,
  list,
  getKycHistory,
  approveKYC,
  rejectKYC
};
