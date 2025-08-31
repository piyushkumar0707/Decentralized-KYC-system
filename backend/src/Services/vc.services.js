//vcservices:
// compute vc hash
// record 
// verify vc
// revoke vc


import VCMetadata from "../models/VCmetadata.models.js";
import AuditLog from "../models/audit_logs.models.js";
import hash from "../Services/hash.js";
import {verifySignature} from '../Services/encryptionService.js';

export function computeHash(vc) {
    return hash(vc);
}

export async function recordVC({vchash, cid, issuerDID, subjectDID, txhash}, actorId) {
    await VCMetadata.create({
        vchash,
        cid,
        issuer: issuerDID,
        subject: subjectDID,
        txhash,
        issuedAt: new Date(),
        signature
    });

    await AuditLog.create({
        action: "VC_RECORDED",
        actor: actorId,
        did: subjectDID,
        metadata: { vchash, cid, txhash }
    });
    return { vchash, cid, txhash };
}

// Verifies that the VC's cryptographic signature matches the issuer's public key.
export async function verifyVCSignature(vc, issuerPublicKey) {
    const isValid = await verifySignature(vc, issuerPublicKey);
    return isValid;

}

export async function revokeVC(vchash, actorId) {
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
        metadata: { vchash }
    });
}
