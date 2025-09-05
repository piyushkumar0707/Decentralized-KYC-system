import { ethers, JsonRpcProvider } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import { fileURLToPath } from "url";

// ---------------------------
// Setup paths for ES Modules
// ---------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------
// Setup provider + signer
// ---------------------------
const provider = new JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
export const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ---------------------------
// Helper to load ABI + deployed address
// ---------------------------
function loadContract(name) {
  // Load ABI from artifact
  const artifactPath = path.join(__dirname, `../../../artifacts/contracts/${name}.sol`, `${name}.json`);
  if (!fs.existsSync(artifactPath)) throw new Error("Artifact not found: " + artifactPath);
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

  // Load deployed address
  const deploymentPath = path.join(__dirname, "../../../migrationsDeployment/deployments.json");
  if (!fs.existsSync(deploymentPath)) throw new Error("Deployment file not found: " + deploymentPath);
  const deployments = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));

  const deployed = deployments[name];
  if (!deployed ) throw new Error(`No address found for ${name} in migrationsDeployment.json`);

  return { abi: artifact.abi, address: deployed.name };
}

// ---------------------------
// Load Contracts
// ---------------------------
const DID = loadContract("DIDRegistry");
const Issuer = loadContract("IssuerRegistry");
const Credential = loadContract("CredentialRegistry");

export const DIDRegistry = new ethers.Contract(DID.address, DID.abi, signer);
export const IssuerRegistry = new ethers.Contract(Issuer.address, Issuer.abi, signer);
export const CredentialRegistry = new ethers.Contract(Credential.address,Credential.abi, signer);

// ---------------------------
// Issuer Verification Wrapper
// ---------------------------
async function ensureIssuer(address) {
  const isIssuer = await IssuerRegistry.isIssuer(address);
  if (!isIssuer) throw new Error(`Address ${address} is not a registered issuer`);
  return true;
}

// ---------------------------
// DID Registry Operations
// ---------------------------
export async function registerDIDOnChain(userAddress, didURI) {
  await ensureIssuer(await signer.getAddress()); // verify caller is an issuer
  const tx = await DIDRegistry.registerDID(userAddress, didURI);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

export async function issuerRevokeDIDOnChain(userAddress, reason) {
  await ensureIssuer(await signer.getAddress()); // verify caller is an issuer
  const tx = await DIDRegistry.issuerRevokeDID(userAddress, reason);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

export async function getDIDOnChain(userAddress) {
  return await DIDRegistry.getDID(userAddress);
}

// ---------------------------
// Credential Registry Operations
// ---------------------------
export async function anchorCredentialOnChain(vcHash) {
  await ensureIssuer(await signer.getAddress());
  const tx = await CredentialRegistry.anchorCredential(vcHash);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

export async function revokeCredentialOnChain(vcHash) {
  await ensureIssuer(await signer.getAddress());
  const tx = await CredentialRegistry.revokeCredential(vcHash);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

export async function getRecord(vcHash) {
  const record = await CredentialRegistry.getRecord(vcHash);
  return {
    issuer: record[0],
    issuedAt: Number(record[1]),
    revoked: record[2],
    revokedAt: Number(record[3]),
  };
}

export async function isVCRevoked(vcHash) {
  return await CredentialRegistry.isRevoked(vcHash);
}

// ---------------------------
// Issuer Checks
// ---------------------------
export async function isOnChainIssuer(address) {
  return await IssuerRegistry.isIssuer(address);
}
