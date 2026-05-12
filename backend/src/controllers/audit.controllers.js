
import audit_logsModels from "../models/audit_logs.models.js";
import ApiError from "../utility/ApiError.js";

import ApiResponse from "../utility/ApiResponse.js";

const list = async (req, res, next) => {
    try {
        let filter = {};
        if (req.user.role !== 'admin') {
            filter.actor = req.user._id;
        }
        const logs = await audit_logsModels.find(filter).populate('actor', 'username email').sort({createdAt:-1}).limit(200);
        return res.json(new ApiResponse(200, logs, "Logs retrieved successfully"));
    } catch (error) {
        next(new ApiError(400, "Logs retrieval failed"));
    }
}
export default list;