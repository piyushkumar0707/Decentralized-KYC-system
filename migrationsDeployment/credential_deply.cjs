require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Deploying CredentialRegistry with account:", deployer.address);
  console.log("💰 Deployer balance:", (await deployer.getBalance()).toString());

  // Read IssuerRegistry address from .env
  const issuerRegistryAddress = process.env.ISSUER_REGISTRY_ADDRESS;
  if (!issuerRegistryAddress) {
    throw new Error("❌ Please set ISSUER_REGISTRY_ADDRESS in your .env file");
  }
  console.log("📌 Using IssuerRegistry at:", issuerRegistryAddress);

  // Compile + Load CredentialRegistry contract
  const CredentialRegistry = await hre.ethers.getContractFactory(
    "contracts/CredentialRegistry.sol:CredentialRegistry"
  );

  // Deploy CredentialRegistry with IssuerRegistry address
  const credentialRegistry = await CredentialRegistry.deploy(issuerRegistryAddress);
  await credentialRegistry.deployed();

  console.log("✅ CredentialRegistry deployed at:", credentialRegistry.address);

const artifactPath = path.join(__dirname, "../artifacts/contracts/CredentialRegistry.sol/CredentialRegistry.json");
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

// Load old contracts.json if exists
const contractsFile = path.join(__dirname, "contracts.json");
let contracts = {};
if (fs.existsSync(contractsFile)) {
  contracts = JSON.parse(fs.readFileSync(contractsFile, "utf8"));
}

contracts.credentialRegistry = {
  address: credentialRegistry.address,
  abi: artifact.abi,
};

fs.writeFileSync(contractsFile, JSON.stringify(contracts, null, 2));
  console.log(`📂 Address + ABI saved in ${contractsFile}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
