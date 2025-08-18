import mongoose from "mongoose";

const audit_logs=new mongoose.Schema({
action:{
    type:String,
    required:true
},
actor:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"

},
did:{
    type:String
},
metadata:{
    type:Object
}

},{timestamps:true});

export default auditLogs=mongoose.model("auditLogs",audit_logs)