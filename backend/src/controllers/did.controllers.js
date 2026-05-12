import DIDModels from "../models/DID.models.js";
import audit_logsModels from "../models/audit_logs.models.js";
import { uploadJsonToPinata } from "../middleware/ipfs.middleware.js";
import ApiError from "../utility/ApiError.js";
import ApiResponse from "../utility/ApiResponse.js";
import User from "../models/user.models.js";
import { ethers } from "ethers";
import { isOnChainIssuer } from "../Services/blockChain.services.js";
import {
  registerDIDOnChain,
  revokeDIDOnChain as issuerRevokeDIDOnChain,
  getDIDOnChain,
} from "../Services/blockChain.services.js";
import { wallet as backendWallet } from "../config/blockchain.js";

const registerDID = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = ethers.utils.isAddress(userId)
      ? await User.findOne({ wallet: userId.toLowerCase() })
      : await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    if (!user.wallet) throw new ApiError(400, "User wallet address is required");

    // Check if DID already exists
    const existing = await DIDModels.findOne({ user: user._id });
    if (existing)
      return res.json(new ApiResponse(200, existing, "DID already exists"));

    if (!(await isOnChainIssuer(backendWallet.address))) {
      throw new ApiError(500, "Issuer not recognized on blockchain");
    }
    const userAddress = user.wallet.toLowerCase();
    const did = `did:ethr:${userAddress}:${user._id.toString()}`;


   
    const didDocument = {
      "@context": "https://www.w3.org/ns/did/v1",
      id: did,
      controller: did,
      verificationMethod: [
        {
          id: `${did}#keys-1`,
          type: "EcdsaSecp256k1VerificationKey2019",
          controller: did,
          blockchainAccountId: userAddress
        }
      ]
    };
    const cid = await uploadJsonToPinata(didDocument, `did-${did}`);
    const txHash = await registerDIDOnChain(userAddress, did);
    const rec = await DIDModels.create({
      user: user._id,
      did,
      didAddress: userAddress,
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
return res.json(new ApiResponse(200, { 
  did, 
  didAddress: userAddress,
  txHash,
  didDocumentCID: cid 
}));
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const user = userId
      ? ethers.utils.isAddress(userId)
        ? await User.findOne({ wallet: userId.toLowerCase() })
        : await User.findById(userId)
      : await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");

    const rec = await DIDModels.findOne({ user: user._id });
    if (!rec) throw new ApiError(404, "DID not found");

    const did = await getDIDOnChain(user.wallet);

  return res.json(new ApiResponse(200, {
      did: did || rec.did,
      didAddress: rec.didAddress,
      ipfsCid: rec.didDocumentCID
    }));
  } catch (error) {
    next(error);
  }
};

const revoke=async(req,res,next)=>{
 const {userId,reason}=req.body;
 const user=ethers.utils.isAddress(userId)
   ? await User.findOne({ wallet: userId.toLowerCase() })
   : await User.findById(userId);
 if(!user) throw new ApiError(404,"User not found");

 const rec=await DIDModels.findOne({user:user._id});
 if(!rec) throw new ApiError(404,"DID not found");
    if (!(await isOnChainIssuer(backendWallet.address))) {
      throw new ApiError(403, "Caller not recognized as issuer");
    }
 const txHash=await issuerRevokeDIDOnChain(user.wallet);

  await DIDModels.findByIdAndDelete(rec._id);
 await audit_logsModels.create({
   action:"DID_revoked",
   actor:req.user.id,
   did:rec.did,
   metadata:{did:rec.did,reason,userId:user._id}
 });
  return res.json(new ApiResponse(200, { txHash }));
}
export { getUser, registerDID, revoke };
