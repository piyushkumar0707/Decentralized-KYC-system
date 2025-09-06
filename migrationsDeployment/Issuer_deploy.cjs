const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying IssuerRegistry with account:", deployer.address);
  console.log("Deployer balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const IssuerRegistry = await hre.ethers.getContractFactory("contracts/IssuerRegistry.sol:IssuerRegistry");
  const issuerRegistry = await IssuerRegistry.deploy(deployer.address); // initial admin

  await issuerRegistry.deployed();
  const address = issuerRegistry.address;

  console.log("✅ IssuerRegistry deployed at:", issuerRegistry.address);

  // --- Prepare ABI + Address ---
  const artifactPath = path.join(__dirname, "../artifacts/contracts/IssuerRegistry.sol/IssuerRegistry.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  // Load old contracts.json if exists
  const contractsFile = path.join(__dirname, "contracts.json");
  let contracts = {};
  if (fs.existsSync(contractsFile)) {
    contracts = JSON.parse(fs.readFileSync(contractsFile, "utf8"));
  }

  contracts.issuerRegistry = {
    address: issuerRegistry.address,
    abi: artifact.abi,
  };

  fs.writeFileSync(contractsFile, JSON.stringify(contracts, null, 2));
  console.log(`📂 Address + ABI saved in ${contractsFile}`);
}


main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
