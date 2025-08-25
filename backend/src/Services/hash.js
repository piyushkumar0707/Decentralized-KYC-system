import crypto from "crypto";
import canonicalize from "canonicalize";

const computeHash = (objOrBuffer) => {
    if (Buffer.isBuffer(objOrBuffer)) {
        return '0x' + crypto.createHash('sha256').update(objOrBuffer).digest('hex');
    }

    try {
        const res = canonicalize(objOrBuffer);
        return '0x' + crypto.createHash('sha256').update(res).digest('hex');
    } catch (e) {
        throw new Error("Invalid input for hashing: must be Buffer or serializable object.");
    }
};

export default computeHash;
