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
  const address = await issuerRegistry.address();

  console.log("✅ IssuerRegistry deployed at:", address);

  // Save address in a file
  const deploymentsFile = path.join(__dirname, "deployments.json");
  fs.writeFileSync(
    deploymentsFile,
    JSON.stringify({ IssuerRegistry: address }, null, 2)
  );
  console.log(`📂 Address saved in ${deploymentsFile}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
