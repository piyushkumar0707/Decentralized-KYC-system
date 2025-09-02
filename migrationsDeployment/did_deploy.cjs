
const hre = require("hardhat");

async function main() {
  const issuerRegistryAddress = "0x123..."; // replace with actual deployed IssuerRegistry address

  const DIDRegistry = await hre.ethers.getContractFactory("DIDRegistry");
  const didRegistry = await DIDRegistry.deploy(issuerRegistryAddress);

  await didRegistry.waitForDeployment();
  console.log("DIDRegistry deployed at:", await didRegistry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
