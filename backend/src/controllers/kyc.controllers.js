import fs from 'fs';
import KYCrequestsModels from '../models/KYCrequests.models.js';
import audit_logsModels from '../models/audit_logs.models.js';
import { uploadFileBufferToPinata } from '../middleware/ipfs.middleware.js';
import {keyID } from '../config/KMS.js';
import { encryptionBuffer } from '../Services/encryptionService.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// Submit KYC
const submitKYC = async (req, res) => {
  try {
    const { did, documentType } = req.body;
    if (!did) throw new ApiError(400, "DID is required");
    if (!req.file) throw new ApiError(400, "File is required");

    const buffer = fs.readFileSync(req.file.path);

    // Encrypt and wrap AES key
    const { cipherText, meta } = await encryptionBuffer(buffer);
    const ipfsHash = await uploadFileBufferToPinata(cipherText);

    fs.unlinkSync(req.file.path); // Clean up local file

    const kycRequest = await KYCrequestsModels.create({
      user: req.user.id,
      did,
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

    return new ApiResponse(res, 201, "KYC request submitted successfully", { kycRequest });
  } catch (error) {
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

    return new ApiResponse(res, 200, "Pending KYC requests retrieved", {
      kycRequests
    });
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Internal Server Error", {
      error: error.message
    }));
  }
};

// Review (Approve/Reject) KYC Requests
const reviewKYC = async (req, res) => {
  try {
    const { id, status } = req.body;

    const kycRequest = await KYCrequestsModels.findById(id);
    if (!kycRequest) throw new ApiError(404, "KYC request not found");

    if (req.user.role !== "verifier") {
      throw new ApiError(403, "You are not authorized to review KYC requests");
    }
    if (!["approved", "rejected"].includes(status)) {
      throw new ApiError(400, "Invalid status");
    }

      kycRequest.status = status;
    await kycRequest.save();

    await audit_logsModels.create({
      action: "KYC_Request_Reviewed",
      actor: req.user.id,
      metadata: {
        id,
        status
      }
    });

    return new ApiResponse(res, 200, "KYC request reviewed", { kycRequest });
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Internal Server Error", {
      error: error.message
    }));
  }
};

export {
  submitKYC,
  list,
  reviewKYC
};
