import fs from "fs";
import path from "path";
import crypto from "crypto";

const __dirname = path.resolve();

// Resolve absolute paths for keys
const privPath = path.join(__dirname, "/src/keys/rsa_priv.pem");
const pubPath = path.join(__dirname, "/src/keys/rsa_pub.pem");

let PRIV = null;
let PUB = null;

try {
  PRIV = fs.readFileSync(privPath, "utf-8");
  PUB = fs.readFileSync(pubPath, "utf-8");
  console.log("✅ RSA keys loaded successfully.");
} catch (err) {
  console.error("❌ RSA key files not found. Please generate keys first:", err.message);
}

const keyID = "rsa-dev-v1";

// Wrap a symmetric AES key with RSA-OAEP-SHA256
const wrapAESkey = async (aeskeyBuf) => {
  if (!PUB) throw new Error("Public key not loaded. Generate rsa_pub.pem first.");
  return crypto.publicEncrypt(
    {
      key: PUB,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    aeskeyBuf
  );
};

// Unwrap AES key
const unwrapAESKey = async (wrappedBuf) => {
  if (!PRIV) throw new Error("Private key not loaded. Generate rsa_priv.pem first.");
  return crypto.privateDecrypt(
    {
      key: PRIV,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    wrappedBuf
  );
};

export { wrapAESkey, unwrapAESKey, keyID };
