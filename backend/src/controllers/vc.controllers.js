import VCMetadata from "../models/VCMetadata.js";
import AuditLog from "../models/AuditLog.js";
import { canonicalize, sha256hex } from "../utils/cryptoUtils.js";
import { uploadJSONToIPFS } from "../services/ipfsService.js";
import { credentialRegistry } from "../config/web3.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export async function issueVC(req, res) {
  const { vc, issuerDID, subjectDID } = req.body;

  if (!vc || !issuerDID || !subjectDID) {
    throw new ApiError(400, "vc, issuerDID, and subjectDID are required");
  }

  // Canonize & hash
  const canonicalVC = canonicalize(vc);
  const vchash = sha256hex(canonicalVC);

  // Anchor VC on blockchain
  let txhash;
  try {
    const tx = await credentialRegistry.anchorCredential(vchash);
    const receipt = await tx.wait();
    txhash = receipt.transactionHash;
  } catch (err) {
    throw new ApiError(500, "Failed to anchor VC on blockchain: " + err.message);
  }

  // Upload VC JSON to IPFS
  let cid;
  try {
    cid = await uploadJSONToIPFS(vc, `vc-${vchash}`);
  } catch (err) {
    throw new ApiError(500, "Failed to upload VC to IPFS: " + err.message);
  }

  // Record in database
  const record = await VCMetadata.create({
    issuedTo: subjectDID,
    vchash,
    ipfs_cid: cid,
    issuer: issuerDID,
    anchored: true,
    txhash
  });

  await AuditLog.create({
    action: "VC_ISSUED",
    actor: req.user._id,
    did: subjectDID,
    metadata: { vchash, cid, txhash }
  });

  return new ApiResponse(res, 201, "VC issued successfully", {
    vchash,
    cid,
    txhash
  });
}

export async function verifyVC(req, res) {
  const { vchash } = req.query;
  if (!vchash) {
    throw new ApiError(400, "vchash query parameter is required");
  }

  const record = await VCMetadata.findOne({ vchash });
  if (!record) {
    return res.json(new ApiResponse(res, 404, "VC not found", { verified: false }));
  }

  // Optionally: fetch record from chain for revocation status
  const onChain = await credentialRegistry.getRecord(vchash);

  const verified = !record.revoked && !onChain[2]; // onChain[2] is revoked flag

  return new ApiResponse(res, 200, "VC Verification Status", {
    verified,
    anchored: record.anchored,
    revoked: record.revoked,
    issuedAt: record.issuedAt,
    revokedAt: record.revokedAt
  });
}

export async function revokeVC(req, res) {
  const { vchash } = req.body;
  if (!vchash) {
    throw new ApiError(400, "vchash is required");
  }

  const record = await VCMetadata.findOne({ vchash });
  if (!record) {
    throw new ApiError(404, "VC not found");
  }
  if (record.revoked) {
    throw new ApiError(400, "VC is already revoked");
  }

  let txhash;
  try {
    const tx = await credentialRegistry.revokeCredential(vchash);
    const receipt = await tx.wait();
    txhash = receipt.transactionHash;
  } catch (err) {
    throw new ApiError(500, "Failed to revoke VC on blockchain: " + err.message);
  }

  record.revoked = true;
  record.revokedAt = new Date();
  await record.save();

  await AuditLog.create({
    action: "VC_REVOKED",
    actor: req.user._id,
    did: record.issuedTo,
    metadata: { vchash, txhash }
  });

  return new ApiResponse(res, 200, "VC revoked successfully", {
    vchash,
    txhash
  });
}
