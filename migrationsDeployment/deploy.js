const hre = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Deploy IssuerRegistry
  const IssuerRegistry = await hre.ethers.getContractFactory("IssuerRegistry");
  const issuerRegistry = await IssuerRegistry.deploy(deployer.address);
  await issuerRegistry.deployed();
  console.log("IssuerRegistry:", issuerRegistry.address);

  // Deploy DIDRegistry
  const DIDRegistry = await hre.ethers.getContractFactory("DIDRegistry");
  const didRegistry = await DIDRegistry.deploy();
  await didRegistry.deployed();
  console.log("DIDRegistry:", didRegistry.address);

  // Deploy CredentialRegistry
  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy(issuerRegistry.address);
  await credentialRegistry.deployed();
  console.log("CredentialRegistry:", credentialRegistry.address);

  // Add deployer as issuer
  await (await issuerRegistry.addIssuer(deployer.address)).wait();
  console.log("Added deployer as issuer.");

  // Save contract info
  const contracts = {
    issuerRegistry: {
      address: issuerRegistry.address,
      abi: JSON.parse(IssuerRegistry.interface.formatJson())
    },
    didRegistry: {
      address: didRegistry.address,
      abi: JSON.parse(DIDRegistry.interface.formatJson())
    },
    credentialRegistry: {
      address: credentialRegistry.address,
      abi: JSON.parse(CredentialRegistry.interface.formatJson())
    }
  };

  const backendPath = path.join(__dirname, "../backend/src/config/contract.json");
  const frontendPath = path.join(__dirname, "../frontend/src/config/contract.json");

  fs.writeFileSync(backendPath, JSON.stringify(contracts, null, 2));
  fs.writeFileSync(frontendPath, JSON.stringify(contracts, null, 2));

  console.log("Contract ABIs and addresses saved to backend & frontend config.");
}

// Run main
main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

