const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying DIDRegistry with account:", deployer.address);
  console.log("Deployer balance:", (await deployer.getBalance()).toString());

  // Read IssuerRegistry address from deployments.json (using chainId as key)
  const deploymentsFile = path.join(__dirname, "deployments.json");
  const deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8"));
  const chainId = "80002";
  const issuerRegistryAddress = deployments[chainId]?.IssuerRegistry;
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

const artifactPath = path.join(__dirname, "../artifacts/contracts/DIDRegistry.sol/DIDRegistry.json");
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
// Load old contracts.json if exists
const contractsFile = path.join(__dirname, "contracts.json");
let contracts = {};
if (fs.existsSync(contractsFile)) {
  contracts = JSON.parse(fs.readFileSync(contractsFile, "utf8"));
}
contracts.didRegistry = {
  address: didRegistry.address,
  abi: artifact.abi,
};
fs.writeFileSync(contractsFile, JSON.stringify(contracts, null, 2));
  console.log(`📂 Address + ABI saved in ${contractsFile}`);
}
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
