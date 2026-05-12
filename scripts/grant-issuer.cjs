/**
 * Grants ISSUER_ROLE on IssuerRegistry to the address derived from PRIVATE_KEY
 * (the same key the Node backend uses to anchor credentials).
 *
 * Must be run as the registry admin — typically Hardhat account #0 when using `hardhat node`.
 *
 * Usage: npx hardhat run scripts/grant-issuer.cjs --network localhost
 */
require("dotenv").config({ path: require("path").join(__dirname, "../backend/.env") });
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) {
    throw new Error("PRIVATE_KEY is not set (expected in backend/.env or process env).");
  }

  const [admin] = await hre.ethers.getSigners();
  const contractsPath = path.join(__dirname, "../migrationsDeployment/contracts.json");
  const contracts = JSON.parse(fs.readFileSync(contractsPath, "utf8"));
  const ir = contracts.issuerRegistry;
  if (!ir?.address || !ir?.abi) {
    throw new Error("issuerRegistry missing in migrationsDeployment/contracts.json — deploy first.");
  }

  const issuerRegistry = await hre.ethers.getContractAt(ir.abi, ir.address, admin);
  const backendWallet = new hre.ethers.Wallet(pk, hre.ethers.provider);

  const tx = await issuerRegistry.addIssuer(backendWallet.address);
  await tx.wait();
  console.log("ISSUER_ROLE granted to backend wallet:", backendWallet.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
