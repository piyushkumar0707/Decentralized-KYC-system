import DIDModels from "../models/DID.models";
import audit_logsModels from "../models/audit_logs.models";
import {uploadJsonToPinata} from "../../middleware/ipfs.middleware";
import userModels from "../models/user.models.js";
import ApiError from '../../utility/ApiError';
import ApiResponse from "../utils/ApiResponse.js";

const registerDID=async(req,res,next)=>{
  try {
    const {did,didDocument}=req.body;
    if(!did ||!didDocument){
        throw new ApiError(400,"did +  didDocument is required");

    }

    const cid=await uploadJsonToPinata(didDocument,`did-${did}`);
    const res=await DIDModels.create({
        user:req.user.id,
        did,
        didDocumentCID:cid
    });
    const updateUser=await User.findByIdAndUpdate(req.user.id,{did});
    await audit_logsModels.create({
        action:"DID_added",
        actor:req.user.id,did,
        metadata:{didDocumentCID:cid}
    });
    return new ApiResponse(200,{did,didDocumentCID:cid});
  } catch (error) {
    next(error);
  }
}

const getUser=async (req,res,next)=>{
try {
    const res=await DIDModels.findOne({user:req.user.id});
    return new ApiResponse(200,{res});
} catch (error) {
    next(error);
    throw new ApiError(400,"DID FAILED");
}
}

export {getUser,registerDID};