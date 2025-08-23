const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();// getting the metamask account of deployers here or ethereum account
  console.log("Deployer address:", deployer.address);

  const IssuerRegistry = await hre.ethers.getContractFactory("IssuerRegistry");// getContractfactory brings all the compiled contacts into issuer registry
  const issuerRegistry = await IssuerRegistry.deploy(deployer.address);
  await issuerRegistry.deployed();
  console.log("IssuerRegistry:", issuerRegistry.address);

  const DIDRegistry = await hre.ethers.getContractFactory("DIDRegistry");
  const didRegistry = await DIDRegistry.deploy();
  await didRegistry.deployed();
  console.log("DIDRegistry:", didRegistry.address);

  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy(issuerRegistry.address);
  await credentialRegistry.deployed();
  console.log("CredentialRegistry:", credentialRegistry.address);

  // Add deployer as issuer
  await (await issuerRegistry.addIssuer(deployer.address)).wait();// here making issuer the deployer
  console.log("Added deployer as issuer.");

  // print addresses JSON for convenience
  console.log(JSON.stringify({ // this is beautifully keeping the strings of all the required contracts 
    issuerRegistry: issuerRegistry.address,
    didRegistry: didRegistry.address,
    credentialRegistry: credentialRegistry.address
  }, null, 2));
}

main().catch((err) => { // this is for the error , if any error then this msg will be printed
  console.error(err);
  process.exitCode = 1;
});
