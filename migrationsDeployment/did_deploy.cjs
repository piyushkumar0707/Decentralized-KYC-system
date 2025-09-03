const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying DIDRegistry with account:", deployer.address);
  console.log("Deployer balance:", (await deployer.getBalance()).toString());

  // Read IssuerRegistry address from deployments.json
  const deploymentsFile = path.join(__dirname, "deployments.json");
  const deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8"));
  const issuerRegistryAddress = deployments.IssuerRegistry;
  if (!issuerRegistryAddress || !issuerRegistryAddress.startsWith("0x")) {
    throw new Error(
      `❌ Invalid IssuerRegistry address in deployments.json: ${issuerRegistryAddress}`
    );
  }
  console.log("Using IssuerRegistry at:", issuerRegistryAddress);

  // Load DIDRegistry contract
  const DIDRegistry = await hre.ethers.getContractFactory("DIDRegistry");

  // Deploy with IssuerRegistry address
  const didRegistry = await DIDRegistry.deploy(issuerRegistryAddress);
  await didRegistry.deployed();

  console.log("✅ DIDRegistry deployed at:", didRegistry.address);

  // Save DID address too
  deployments.DIDRegistry = didRegistry.address;
  fs.writeFileSync(deploymentsFile, JSON.stringify(deployments, null, 2));
  console.log(`📂 Address saved in ${deploymentsFile}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
