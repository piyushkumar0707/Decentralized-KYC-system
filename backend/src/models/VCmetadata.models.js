import mongoose from "mongoose";

const VCmetadata=new mongoose.Schema({
issuedTo:{
    type:String,
    required:true //DID of the user
},
vchash:{
    type:String,
    required:true,
    unique:true
},
ipfs_cid:{
    type:String,
    required:true
},
issuer:{
type:String,
required:true //DID of the issuser
},
anchored:{
type:Boolean,
default:false
},
txhash:{
type:String, //blockchain transaction hash
required:true
},
issuedAt:{
    type:Date,
    deafult:Date.now
},
revoked:{
    type:Boolean,
    default:false
},
revokedAt:{
    type:Date.now
},
},
{timestamps:true});

export default VCMetadata=mongoose.model("VCMetadata",VCmetadata);