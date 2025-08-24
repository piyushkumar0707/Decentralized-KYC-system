const {ethers} = require ("chai");
const {ethers} = require("hardhat");

describe("KYC end to end flow" , function(){
  let deployer , issuer , user , verifier , admin;
  let IssuerRegistry , DIDRegistry , CredentialRegistry;
  let issuerRegistry , didRegistry , credentialRegistry;
  
  beforeEach(async () => {
    // Test actors from hardhat's local node
      [deployer , issuer , user , verifier , admin] = await ethers.getSigners();
     // Contracts factories (blueprint compiled hardhat)
     IssuerRegistry = await ethers.getContractFractory("IssuerRegistry" , deployer);
     DIDRegistry = await ethers.getContractFractory("DIDRegistry" , deployer);
     CredentialRegistry = await ethers.getContractFractory("CredentialRegistry" , deployer);

     //deploy fresh instances before the test
     issuerRegistry = await IssuerRegistry.deploy();
     didRegistry = await DIDRegistry.deploy();
     credentialRegistry = await CredentialRegistry.deploy(issuerRegistry.address);

  });
  it("initializes with deployer as DEFAULT_ADMIN_ROLE" , async () => {
     const DEFAULT_ADMIN_ROLE = await issuerRegistry.DEFAULT_ADMIN_ROLE;
     // Default admin role is an access control by openZappline it can frant revoke or revoke it's own role
     expect(await issuerRegistry.hasRole(DEFAULT_ADMIN_ROLE , deployer.address));
  });

  it("")

});
