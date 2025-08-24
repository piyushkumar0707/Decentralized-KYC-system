import crypto from "crypto";

export function computeSHA256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function computeHMACSHA512(data, key) {
  return crypto.createHmac("sha512", key).update(data).digest("base64");
}
