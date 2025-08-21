const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KYC contracts flow", function () {
  let admin, issuer, user, other;
  let issuerRegistry, didRegistry, credentialRegistry;

  beforeEach(async () => {
    [admin, issuer, user, other] = await ethers.getSigners();

    const IssuerRegistry = await ethers.getContractFactory("IssuerRegistry");
    issuerRegistry = await IssuerRegistry.connect(admin).deploy(admin.address);
    await issuerRegistry.deployed();

    await issuerRegistry.connect(admin).addIssuer(issuer.address);

    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    didRegistry = await DIDRegistry.deploy();
    await didRegistry.deployed();

    const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
    credentialRegistry = await CredentialRegistry.deploy(issuerRegistry.address);
    await credentialRegistry.deployed();
  });

  it("registers DID and anchors/revokes VC", async () => {
    await didRegistry.connect(user).registerDID("ipfs://did-user-1");
    expect(await didRegistry.getDID(user.address)).to.equal("ipfs://did-user-1");

    const vcHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("vc-payload"));
    await expect(credentialRegistry.connect(issuer).anchorCredential(vcHash))
      .to.emit(credentialRegistry, "CredentialAnchored");

    await expect(credentialRegistry.connect(issuer).revokeCredential(vcHash))
      .to.emit(credentialRegistry, "CredentialRevoked");

    expect(await credentialRegistry.isRevoked(vcHash)).to.equal(true);
  });
});
