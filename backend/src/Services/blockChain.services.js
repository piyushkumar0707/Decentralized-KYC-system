import { ethers ,JsonRpcProvider} from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();


const provider = new JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
export const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function load(name) {
  const p = path.join(__dirname, `../../../artifacts/contracts/${name}.sol`, `${name}.json`);
  if (!fs.existsSync(p)) throw new Error("File not found: " + p);
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}


const DID = load("DIDRegistry");
const Issuer = load("IssuerRegistry");
const Credential = load("CredentialRegistry");

export const DIDRegistry = new ethers.Contract(DID.address, DID.abi, signer);
export const IssuerRegistry = new ethers.Contract(Issuer.address, Issuer.abi, signer);
export const CredentialRegistry = new ethers.Contract(Credential.address, Credential.abi, signer);

// wrappers
export async function registerDIDOnChain(userAddress, didURI){
  const tx = await DIDRegistry.registerDID(userAddress, didURI);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}
export async function issuerRevokeDIDOnChain(userAddress, reason){
  const tx = await DIDRegistry.issuerRevokeDID(userAddress, reason);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}
export async function anchorCredentialOnChain(vcHash){
  const tx = await CredentialRegistry.anchorCredential(vcHash);
  const r = await tx.wait();
  return r.transactionHash;
}
export async function revokeCredentialOnChain(vcHash){
  const tx = await CredentialRegistry.revokeCredential(vcHash);
  const r = await tx.wait();
  return r.transactionHash;
}
export async function isOnChainIssuer(address){
  return await IssuerRegistry.isIssuer(address);
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

// Check if revoked
export async function isVCRevoked(vcHash) {
  return await CredentialRegistry.isRevoked(vcHash);
}

export async function getDIDOnChain(userAddress){
  return await DIDRegistry.getDID(userAddress);
}