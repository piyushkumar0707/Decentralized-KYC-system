import mongoose from "mongoose";

const KYCSchema=new mongoose.Schema({
user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
},
did:{type:String,
    required:true
},
documentType:{
    type:String
},
documentCID:{
    type:String
},
status:{
    type:String,
    enum:['pending','approved','rejected'],
    default:'pending'
    
}
},{
    timestamps:true
});

export default KYC=mongoose.model("KYC",KYCSchema);