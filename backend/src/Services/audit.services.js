import auditLogs from '../models/audit_logs.models'

export function logaction({action,actor,did,metadata}){
    const logEntry=new auditLogs({
        action,
        actor,
        did,
        metadata
    });

    logEntry.save().catch(err=>console.error("Failed to save audit log:",err));
}

