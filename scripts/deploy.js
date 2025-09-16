const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy IssuerRegistry first
  console.log("\n📋 Deploying IssuerRegistry...");
  const IssuerRegistry = await hre.ethers.getContractFactory("contracts/IssuerRegistry.sol:IssuerRegistry");
  const issuerRegistry = await IssuerRegistry.deploy(deployer.address);
  await issuerRegistry.deployed();
  console.log("✅ IssuerRegistry deployed to:", issuerRegistry.address);

  // Deploy DIDRegistry
  console.log("\n📋 Deploying DIDRegistry...");
  const DIDRegistry = await hre.ethers.getContractFactory("contracts/DIDRegistry.sol:DIDRegistry");
  const didRegistry = await DIDRegistry.deploy(issuerRegistry.address);
  await didRegistry.deployed();
  console.log("✅ DIDRegistry deployed to:", didRegistry.address);

  // Deploy CredentialRegistry
  console.log("\n📋 Deploying CredentialRegistry...");
  const CredentialRegistry = await hre.ethers.getContractFactory("contracts/CredentialRegistry.sol:CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy(issuerRegistry.address);
  await credentialRegistry.deployed();
  console.log("✅ CredentialRegistry deployed to:", credentialRegistry.address);

  // Save contract addresses and ABIs
  const contractsPath = path.join(__dirname, "../migrationsDeployment/contracts.json");
  
  // Load artifacts to get ABIs
  const issuerArtifact = await hre.artifacts.readArtifact("contracts/IssuerRegistry.sol:IssuerRegistry");
  const didArtifact = await hre.artifacts.readArtifact("contracts/DIDRegistry.sol:DIDRegistry");
  const credentialArtifact = await hre.artifacts.readArtifact("contracts/CredentialRegistry.sol:CredentialRegistry");

  const contracts = {
    issuerRegistry: {
      address: issuerRegistry.address,
      abi: issuerArtifact.abi
    },
    didRegistry: {
      address: didRegistry.address,
      abi: didArtifact.abi
    },
    credentialRegistry: {
      address: credentialRegistry.address,
      abi: credentialArtifact.abi
    }
  };

  fs.writeFileSync(contractsPath, JSON.stringify(contracts, null, 2));
  console.log(`\n📂 Contract addresses and ABIs saved to ${contractsPath}`);

  // Also save to deployments.json for tracking
  const deploymentsPath = path.join(__dirname, "../migrationsDeployment/deployments.json");
  const deployments = {
    network: "localhost",
    chainId: 31337,
    deployedAt: new Date().toISOString(),
    contracts: {
      issuerRegistry: issuerRegistry.address,
      didRegistry: didRegistry.address,
      credentialRegistry: credentialRegistry.address
    }
  };

  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log(`📂 Deployment info saved to ${deploymentsPath}`);

  console.log("\n🎉 All contracts deployed successfully!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
