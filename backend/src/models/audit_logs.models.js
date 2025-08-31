import mongoose from "mongoose";

const audit_logsSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  did: {
    type: String
  },
  metadata: {
    type: Object
  }
}, { timestamps: true });

const audit_logs = mongoose.model("audit_logs", audit_logsSchema);
export default audit_logs;
