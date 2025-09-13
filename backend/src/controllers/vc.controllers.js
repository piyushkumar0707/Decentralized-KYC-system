import VCMetadata from "../models/VCmetadata.models.js";
import AuditLog from "../models/audit_logs.models.js";
import hash from "../Services/hash.js";
import { uploadJsonToPinata } from "../middleware/ipfs.middleware.js";
import { signJson } from "../Services/encryptionService.js";
import ApiError from "../utility/ApiError.js";
import ApiResponse from "../utility/ApiResponse.js";
import { recordVC } from "../Services/vc.services.js";
import crypto from "crypto";
import { anchorCredentialOnChain,revokeCredentialOnChain,getRecord,isVCRevoked } from "../Services/blockChain.services.js";

export async function issueVC({ kyc, issuerUser }) {
  if (!kyc || !issuerUser) {
    throw new ApiError(400, "KYC and issuerUser are required");
  }
  const vc = {
    "@context": "https://www.w3.org/2018/credentials/v1",
    id: `urn:uuid:${crypto.randomUUID()}`,
    type: ["VerifiableCredential", "KYC"],
    issuer: issuerUser.did,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: kyc.did,
          kycRequestId: kyc._id,
      name: kyc.name,
      document: kyc.document,
    },
  };

  const vchash = hash(vc);

  //sign vc
  const { json: vcJsonString, signature } = await signJson(vc, process.env.RSA_PRIVATE_KEY);

  // Upload VC JSON + signature to IPFS
  let cid;
  try {
    cid = await uploadJsonToPinata({ vc, signature }, `vc-${vchash}`);
  } catch (err) {
    throw new ApiError(500, "Failed to upload VC to IPFS: " + err.message);
  }
 
  //anchor on chain
  const txhash = await anchorCredentialOnChain(vchash);


  // Record in database
  const record = await recordVC({
    issuedTo: kyc.did,
    vchash,
    ipfs_cid: cid,
    issuer: issuerUser.did,
    anchored: true,
    txhash,
    signature,
  },issuerUser._id);

  await AuditLog.create({
    action: "VC_ISSUED",
    actor: issuerUser._id,
    did: kyc.did,
    metadata: { vchash, ipfsCid: cid, txHash: txhash, kycId: kyc._id },

  });

  return record;
}



/**
 * Verify VC
 * Query params: ?vchash=<hash>
 */
export async function verifyVC(req, res, next) {
  try {
    const { vchash } = req.query;
    if (!vchash) throw new ApiError(400, "vchash query parameter is required");

    const record = await VCMetadata.findOne({ vchash });
    if (!record) return new ApiResponse(res, 404, "VC not found", { verified: false });

    // On-chain check
    const onChain = await getRecord(vchash); // [issuer, issuedAt, revoked, revokedAt]
    const verified = !record.revoked && !onChain[2]; // true if not revoked on-chain and in DB

    if (!verified) return new ApiResponse(res, 403, "VC is revoked", { verified });

    return new ApiResponse(res, 200, "VC verification successful", {
      verified,
      anchored: record.anchored,
      revoked: record.revoked,
      issuedAt: record.issuedAt,
      revokedAt: record.revokedAt,
    });
  } catch (err) {
    next(err);
  }
}

export async function revokeVC(req, res, next) {
  try {
    const { vchash } = req.body;
    if (!vchash) throw new ApiError(400, "vchash is required");

    const record = await VCMetadata.findOne({ vchash });
    if (!record) throw new ApiError(404, "VC not found");

    if (record.revoked) throw new ApiError(400, "VC is already revoked");

    // Check on-chain status
    const onChain = await getRecord(vchash);
    const verified = !record.revoked && !onChain[2]; // onChain[2] = revoked
    if (!verified) throw new ApiError(403, "VC is revoked on-chain");

    // Revoke on-chain
    const txhash = await revokeCredentialOnChain(vchash);

    // Update DB
    record.revoked = true;
    record.revokedAt = new Date();
    await record.save();

    // Audit log
    await AuditLog.create({
      action: "VC_REVOKED",
      actor: req.user._id,
      did: record.issuedTo,
      metadata: { vchash, txhash },
    });

    return new ApiResponse(res, 200, "VC revoked successfully", { vchash, txhash });
  } catch (err) {
    next(err);
  }
}

export async function getVCRecord(req, res, next) {
  try {
    const vchash = req.params.vchash;
    if (!vchash) throw new ApiError(400, "vchash param required");

    const record = await VCMetadata.findOne({ vchash }).populate("issuer", "username email");
    if (!record) return new ApiResponse(res, 404, "VC not found");

    // On-chain record
    let onChain;
    try {
      onChain = await getRecord(vchash); // returns [issuer, issuedAt, revoked, revokedAt]
    } catch (err) {
      return new ApiResponse(res, 200, "VC metadata fetched (on-chain lookup failed)", {
        record,
        onChainError: err.message,
      });
    }

    return new ApiResponse(res, 200, "VC metadata fetched", {
      record,
      onChain: {
        issuer: onChain[0],
        issuedAt: onChain[1],
        revoked: onChain[2],
        revokedAt: onChain[3],
      },
    });
  } catch (err) {
    next(err);
  }
}
