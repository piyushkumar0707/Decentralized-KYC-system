const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying DIDRegistry with account:", deployer.address);
  console.log("Deployer balance:", (await deployer.getBalance()).toString());

  const contractsJson = path.join(__dirname, "contracts.json");
  let issuerRegistryAddress;
  if (fs.existsSync(contractsJson)) {
    const c = JSON.parse(fs.readFileSync(contractsJson, "utf8"));
    issuerRegistryAddress = c.issuerRegistry?.address;
  }
  if (!issuerRegistryAddress || !issuerRegistryAddress.startsWith("0x")) {
    const deploymentsFile = path.join(__dirname, "deployments.json");
    const deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8"));
    const chainId = String(hre.network.config.chainId || "");
    issuerRegistryAddress =
      deployments[chainId]?.IssuerRegistry ||
      deployments["31337"]?.IssuerRegistry ||
      deployments.IssuerRegistry ||
      deployments.contracts?.issuerRegistry;
  }
  if (!issuerRegistryAddress || !issuerRegistryAddress.startsWith("0x")) {
    throw new Error("Could not resolve IssuerRegistry address (contracts.json or deployments.json).");
  }
  console.log("Using IssuerRegistry at:", issuerRegistryAddress);

  const DIDRegistry = await hre.ethers.getContractFactory("contracts/DIDRegistry.sol:DIDRegistry");

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
