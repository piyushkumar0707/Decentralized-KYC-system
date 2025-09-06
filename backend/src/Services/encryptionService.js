import crypto from "crypto";
import fs from "fs";
import path from "path";
import { wrapAESkey, unwrapAESKey, keyID } from "../config/KMS.js";

const __dirname = path.resolve();
// Load RSA keys (from env or fallback)
const privPath = path.join(__dirname, "/src/keys/rsa_priv.pem");
const pubPath = path.join(__dirname, "/src/keys/rsa_pub.pem");

if (!fs.existsSync(privPath) || !fs.existsSync(pubPath)) {
  console.warn("⚠️ RSA keys not found! Consider running generateRSAKeys()");
}

const privateKey = fs.existsSync(privPath) ? fs.readFileSync(privPath, "utf8") : null;
const publicKey = fs.existsSync(pubPath) ? fs.readFileSync(pubPath, "utf8") : null;

/**
 * Generate new RSA key pair (PEM)
 */
export async function generateRSAKeys() {
  return new Promise((resolve, reject) => {
    crypto.generateKeyPair(
      "rsa",
      {
        modulusLength: 4096,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
      },
      (err, pubKey, privKey) => {
        if (err) reject(err);
        else {
          fs.writeFileSync(privPath, privKey);
          fs.writeFileSync(pubPath, pubKey);
          resolve({ pubKey, privKey });
        }
      }
    );
  });
}

/**
 * Encrypt file buffer with AES-256-GCM
 */
export async function encryptionBuffer(buffer) {
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);
  const cipherText = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  const wrappedKey = await wrapAESkey(aesKey);

  return {
    cipherText,
    meta: {
      algo: "AES-256-GCM",
      keyWrapped: wrappedKey.toString("base64"),
      iv: iv.toString("base64"),
      tag: tag.toString("base64"),
      keyID,
    },
  };
}

/**
 * Decrypt file buffer with AES-256-GCM
 */
export async function decryptBuffer(cipherText, { keyWrapped, iv, tag }) {
  const aeskey = await unwrapAESKey(Buffer.from(keyWrapped, "base64"));
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    aeskey,
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(cipherText), decipher.final()]);
}

/**
 * Sign JSON payload
 */
export async function signJson(data) {
  if (!privateKey) throw new Error("Private key not loaded!");
  const json = JSON.stringify(data);
  const signature = crypto.sign("sha256", Buffer.from(json), {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  });
  return { json, signature: signature.toString("base64") };
}

/**
 * Verify JSON signature
 */
export async function verifySignature(data, signature) {
  if (!publicKey) throw new Error("Public key not loaded!");
  return crypto.verify(
    "sha256",
    Buffer.from(data),
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    },
    Buffer.from(signature, "base64")
  );
}
