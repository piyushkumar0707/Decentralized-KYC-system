import mongoose from "mongoose";
const didSchema=new mongoose.Schema({

    did:{
        type:String,
        required:true,
        unique:true
    },
    method:String,
    didDocumentCID:{
        type:String,
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