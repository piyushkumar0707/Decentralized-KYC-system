import { ethers } from "ethers";
import dotenv from "dotenv";
import { DIDRegistry, IssuerRegistry, CredentialRegistry } from "../config/blockchain.js";

dotenv.config();

async function testConnection() {
  try {
    // 1️⃣ Setup provider
    const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);

    // 2️⃣ Fetch network info
    const network = await provider.getNetwork();
    console.log("Connected network:", network);

    // 3️⃣ Fetch latest block number
    const blockNumber = await provider.getBlockNumber();
    console.log("Latest block number:", blockNumber);

    // 4️⃣ Setup signer (wallet)
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Signer address:", await signer.getAddress());

    // 5️⃣ Fetch signer balance
    const balance = await provider.getBalance(signer.address);
    console.log("Signer MATIC balance:", ethers.utils.formatEther(balance));


    console.log("✅ Connection successful!");
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

testConnection();
// To run this script, use the command: node backend/src/scripts/test-connection.js
