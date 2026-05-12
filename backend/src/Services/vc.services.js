import VCMetadata from "../models/VCmetadata.models.js";
import AuditLog from "../models/audit_logs.models.js";
import hash from "../Services/hash.js";
import { verifySignature } from "../Services/encryptionService.js";

export function computeHash(vc) {
  return hash(vc);
}

/**
 * Persist VC metadata after on-chain anchor + IPFS upload.
 */
export async function recordVC(
  { issuedTo, kyc, vchash, ipfs_cid, issuer, anchored, txhash, signature },
  actorId
) {
  const doc = await VCMetadata.create({
    issuedTo,
    kyc: kyc || undefined,
    vchash,
    ipfs_cid,
    issuer,
    anchored: !!anchored,
    txhash,
    signature,
  });

  await AuditLog.create({
    action: "VC_RECORDED",
    actor: actorId,
    metadata: { vchash, ipfs_cid, txhash },
  });

  return doc;
}

export async function verifyVCSignature(vc, issuerPublicKey) {
  return verifySignature(vc, issuerPublicKey);
}

export async function revokeVCByHash(vchash, actorId) {
  const vc = await VCMetadata.findOne({ vchash });
  if (!vc) {
    throw new Error("VC not found");
  }

  vc.revoked = true;
  vc.revokedAt = new Date();
  await vc.save();

  await AuditLog.create({
    action: "VC_REVOKED",
    actor: actorId,
    metadata: { vchash },
  });
}
