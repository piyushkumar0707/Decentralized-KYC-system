
import audit_logsModels from "../models/audit_logs.models.js";
import ApiError from "../utility/ApiError.js";

const list=async(req,res)=>{
    try {
        const logs=await audit_logsModels.find().populate('actor', 'username email').sort({createdAt:-1}).limit(200);
        return new ApiResponse(200,logs,"Logs retrieved successfully");
    } catch (error) {
        throw new ApiError(400,"Logs creation failed");
    }
}
export default list;