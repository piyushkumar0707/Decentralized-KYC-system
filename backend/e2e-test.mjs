import { ethers } from "ethers";
import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Mongoose User Schema (minimal for testing)
const userSchema = new mongoose.Schema({
  wallet: String,
  role: String,
});
const User = mongoose.model("User", userSchema);

async function runTest() {
  console.log("🚀 Starting E2E Integration Test for Decentralized KYC System...");

  // Connect to DB
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kyc");
  console.log("    📦 Connected to MongoDB");

  // 1. Generate an ISSUER wallet
  console.log("\n[1] 🔐 Generating an Issuer Ethereum wallet...");
  const issuerWallet = ethers.Wallet.createRandom();
  console.log(`    Issuer Address: ${issuerWallet.address}`);
  
  const api = axios.create({ baseURL: "http://localhost:3001" });

  try {
    // 2. Request Nonce
    console.log("\n[2] 🔄 Requesting authentication nonce...");
    const nonceRes = await api.post("/api/user/nonce", { address: issuerWallet.address });
    const nonce = nonceRes.data.data.nonce;

    // 3. Sign Nonce
    console.log("\n[3] ✍️ Signing nonce...");
    const hexMessage = '0x' + Array.from(nonce).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    const signature = await issuerWallet.signMessage(ethers.utils.arrayify(hexMessage));

    // 4. Verify Signature
    console.log("\n[4] 🔐 Verifying signature to login...");
    const verifyRes = await api.post("/api/user/verify", { address: issuerWallet.address, signature });
    const token = verifyRes.data.data.accessToken;
    const userId = verifyRes.data.data.user._id;
    console.log(`    ✅ Login successful!`);

    // 5. Promote user to ISSUER in DB (Bypassing manual DB edit for test)
    console.log("\n[5] 👑 Promoting wallet to ISSUER role in Database...");
    await User.findByIdAndUpdate(userId, { role: "issuer" });
    console.log(`    ✅ Role updated`);

    // Add JWT to future requests
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // 6. Test OCR Service Health
    console.log("\n[6] 📝 Testing OCR Microservice Connection...");
    const ocrHealth = await axios.get("http://127.0.0.1:8000/health");
    console.log(`    ✅ OCR Service Health: ${ocrHealth.data.status}`);

    // 7. Test DID Registration
    // Generate a random user to issue the DID to
    console.log("\n[7] 🔗 Testing DID Registration...");
    const targetUserWallet = ethers.Wallet.createRandom();
    // Register target user to get an ID
    const targetNonceRes = await api.post("/api/user/nonce", { address: targetUserWallet.address });
    
    // We need the Target User's DB ID to issue them a DID
    const targetUserDoc = await User.findOne({ wallet: targetUserWallet.address.toLowerCase() });
    console.log(`    Target User ID: ${targetUserDoc._id}`);

    try {
      // NOTE: This will mock the Pinata IPFS and Blockchain logic.
      // If IPFS is missing keys, this might fail, so we'll see!
      const didRes = await api.post("/api/did/register", { userId: targetUserDoc._id });
      console.log(`    ✅ DID Registered Successfully!`);
      console.log(`    DID: ${didRes.data.data.did}`);
      console.log(`    IPFS CID: ${didRes.data.data.didDocumentCID}`);
    } catch (err) {
      console.error(`    ❌ DID Registration failed (This might be expected if IPFS/Pinata keys are missing in .env): ${err.message}`);
      if (err.response && err.response.data) {
        console.error("       Server response:", JSON.stringify(err.response.data));
      }
    }

    // 8. Test Fetching DID
    console.log("\n[8] 🔍 Testing DID Retrieval API...");
    try {
      const getDidRes = await api.get(`/api/did/user?userId=${targetUserDoc._id}`);
      console.log(`    ✅ DID Found in DB!`);
      console.log(`    Data:`, getDidRes.data.data);
    } catch (err) {
      console.error(`    ❌ Failed to retrieve DID: ${err.response?.data?.message || err.message}`);
    }

  } catch (error) {
    console.error("\n❌ Test Failed:", error.response?.data || error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🏁 Test finished.");
  }
}

runTest();
