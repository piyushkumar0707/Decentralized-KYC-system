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

  // Save deployment addresses to deployments.json
  const deploymentsFile = path.join(__dirname, "deployments.json");
  let deployments = {};
  if (fs.existsSync(deploymentsFile)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8"));
  }
  deployments.CredentialRegistry = credentialRegistry.address;
  deployments.IssuerRegistry = issuerRegistryAddress;

  fs.writeFileSync(deploymentsFile, JSON.stringify(deployments, null, 2));
  console.log(`📂 Addresses saved in ${deploymentsFile}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
