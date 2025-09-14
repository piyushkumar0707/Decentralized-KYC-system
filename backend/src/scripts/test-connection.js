import { provider, wallet } from "../config/blockchain.js";
import { ethers } from "ethers";

async function testConnection() {
  const blockNumber = await provider.getBlockNumber();
  console.log("✅ Connected to blockchain. Current block number:", blockNumber);

  const address = await wallet.getAddress();
  const balance = await wallet.getBalance();
  console.log(
    `🔑 Wallet address: ${address}, balance: ${ethers.utils.formatEther(balance)} ETH`
  );
}

testConnection().catch(console.error);
