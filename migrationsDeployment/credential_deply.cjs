require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Deploying CredentialRegistry with account:", deployer.address);
  console.log("💰 Deployer balance:", (await deployer.getBalance()).toString());

  // Prefer IssuerRegistry from contracts.json (single source of truth with ABI)
  const contractsFile = path.join(__dirname, "contracts.json");
  let issuerRegistryAddress;
  if (fs.existsSync(contractsFile)) {
    const c = JSON.parse(fs.readFileSync(contractsFile, "utf8"));
    issuerRegistryAddress = c.issuerRegistry?.address;
  }
  if (!issuerRegistryAddress || !issuerRegistryAddress.startsWith("0x")) {
    const deploymentsFile = path.join(__dirname, "deployments.json");
    const deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8"));
    const chainId = String(
      hre.network.config.chainId ||
        hre.network.provider?.network?.chainId ||
        ""
    );
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

  // Compile + Load CredentialRegistry contract
  const CredentialRegistry = await hre.ethers.getContractFactory(
    "contracts/CredentialRegistry.sol:CredentialRegistry"
  );

  // Deploy CredentialRegistry with IssuerRegistry address
  const credentialRegistry = await CredentialRegistry.deploy(issuerRegistryAddress);
  await credentialRegistry.deployed();

  console.log("CredentialRegistry deployed at:", credentialRegistry.address);

const artifactPath = path.join(__dirname, "../artifacts/contracts/CredentialRegistry.sol/CredentialRegistry.json");
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

// Load old contracts.json if exists
const contractsOut = path.join(__dirname, "contracts.json");
let contracts = {};
if (fs.existsSync(contractsOut)) {
  contracts = JSON.parse(fs.readFileSync(contractsOut, "utf8"));
}

contracts.credentialRegistry = {
  address: credentialRegistry.address,
  abi: artifact.abi,
};

fs.writeFileSync(contractsOut, JSON.stringify(contracts, null, 2));
  console.log(`Address + ABI saved in ${contractsOut}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
