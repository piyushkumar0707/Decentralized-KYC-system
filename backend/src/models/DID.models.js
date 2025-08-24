import mongoose from "mongoose";
const didSchema=new mongoose.Schema({

    did:{
        type:String,
        required:true,
        unique:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    didDocumentCID:{
        type:String,   //IPFS CID OF DID DOCUMENT
        required:true
    },
    didDocument:Object,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

},{
    timestamps:true
});
export default DID=mongoose.model("DID",didSchema);