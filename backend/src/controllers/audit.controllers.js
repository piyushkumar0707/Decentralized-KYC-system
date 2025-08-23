import audit_logsModels from "../models/audit_logs.models";
import ApiError from "../utility/ApiError";

const list=async(req,res)=>{
    try {
        const logs=await audit_logsModels.find().sort({createdAt:-1}).limit(200);
        return new ApiResponse(200,logs,"Logs created successfully");
    } catch (error) {
        throw new ApiError(400,"Logs creation failed");
    }
}
export default list;