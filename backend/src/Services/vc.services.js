//vcservices:
// compute vc hash
// record 
// verify vc
// revoke vc


import VCMetadata from "../models/VCMetadata.js";
import AuditLog from "../models/AuditLog.js";
import hash from "../utils/hash.js";
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
        issuedAt: new Date()
    });

    await AuditLog.create({
        action: "VC_RECORDED",
        actor: actorId,
        did: subjectDID,
        metadata: { vchash, cid, txhash }
    });
    return { vchash, cid, txhash };
}

export async function verifyVCSignature(vc, issuerPublicKey) {
    const isValid = await verifySignature(vc, issuerPublicKey);
    return isValid;

}

export async function revokeVC(vchash, actorId) {
    await VCMetadata.deleteOne({ vchash });
    await AuditLog.create({
        action: "VC_REVOKED",
        actor: actorId,
        metadata: { vchash }
    });
}
