import fs from "fs";
import path from "path";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();
import { fileURLToPath } from "url";

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load deployed contract data (ABI + address)
const contractPath = path.resolve(__dirname, "../../../migrationsDeployment/contracts.json");
const contracts = JSON.parse(fs.readFileSync(contractPath, "utf-8"));

// Blockchain provider + signer (RPC_URL preferred; BLOCKCHAIN_RPC_URL supported for legacy .env)
const rpcUrl = process.env.RPC_URL || process.env.BLOCKCHAIN_RPC_URL;
if (!rpcUrl) {
  throw new Error("Set RPC_URL (or BLOCKCHAIN_RPC_URL) for blockchain connectivity.");
}
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Helper: load contract using ABI + address from contracts.json
function loadContract(name) {
  if (!contracts[name]) {
    throw new Error(`Contract ${name} not found in contracts.json`);
  }

  return new ethers.Contract(
    contracts[name].address,
    contracts[name].abi,
    wallet
  );
}

// Export ready-to-use instances
export const DIDRegistry = loadContract("didRegistry");
export const IssuerRegistry = loadContract("issuerRegistry");
export const CredentialRegistry = loadContract("credentialRegistry");


export { provider, wallet };
