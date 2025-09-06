import mongoose from "mongoose";
const didSchema=new mongoose.Schema({

    did:{
        type:String,
        required:true,
        unique:true
    },
    didAddress:{
        type:String,   //IPFS CID OF DID DOCUMENT
        required:true
    },
 didDocumentCID: { type: String, required: true },     // IPFS hash of DID Document

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

},{
    timestamps:true
});
const DID=mongoose.model("DID",didSchema);
export default DID;