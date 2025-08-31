import DIDModels from "../models/DID.models.js";
import audit_logsModels from "../models/audit_logs.models.js";
import { uploadJsonToPinata } from "../middleware/ipfs.middleware.js";
import ApiError from "../utility/ApiError.js";
import ApiResponse from "../utility/ApiResponse.js";
import User from "../models/user.models.js";
import {
  registerDIDOnChain,
  issuerRevokeDIDOnChain,
  getDIDOnChain,
} from "../Services/blockChain.services.js";

const registerDID = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Check if DID already exists
    const existing = await DIDModels.findOne({ user: userId });
    if (existing)
      return res.json(new ApiResponse(200, existing, "DID already exists"));

    const did = `did:ethr:${user._id.toString()}`; // Register on blockchain (using issuer’s wallet)
    const didDocument = {
      "@context": "https://www.w3.org/ns/did/v1",
      id: did,
      controller: did,
      verificationMethod: [
        {
          id: `${did}#keys-1`,
          type: "EcdsaSecp256k1VerificationKey2019",
          controller: did,
          blockchainAccountId: user._id.toString()
        }
      ]
    };
    const cid = await uploadJsonToPinata(didDocument, `did-${did}`);
    const txHash = await registerDIDOnChain(userId.toString(), did);
    const rec = await DIDModels.create({
      user: user._id,
      did,
      didAddress: user._id.toString(),
      didDocumentCID: cid
    });

    user.did = did;
    await user.save();

    await audit_logsModels.create({
      action: "DID_added",
      actor: req.user.id,
      did,
      metadata: { did, cid, userId: user._id },
    });
    return new ApiResponse(200, { did, didAddress:user._id.toString() ,didDocumentCID: cid });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const id=userId || req.user.id;
    const did = await getDIDOnChain(id);
    const rec = await DIDModels.findOne({ user: id });
    return new ApiResponse(200, { did, didAddress: id, ipfsCid: rec.didDocumentCID });
  } catch (error) {
    next(error);
    throw new ApiError(400, "DID FAILED");
  }
};

const revoke=async(req,res,next)=>{
 const {userId,reason}=req.body;
 const user=await User.findById(userId);
 if(!user) throw new ApiError(404,"User not found");

 const rec=await DIDModels.findOne({user:userId});
 if(!rec) throw new ApiError(404,"DID not found");
 const txHash=await issuerRevokeDIDOnChain(userId,reason);
 await audit_logsModels.create({
   action:"DID_revoked",
   actor:req.user.id,
   did:rec.did,
   metadata:{did:rec.did,reason,userId:user._id}
 });
 return new ApiResponse(200,{txHash});
}
export { getUser, registerDID, revoke };
