import { DIDRegistry, IssuerRegistry, CredentialRegistry } from "../config/blockchain.js";

export async function registerDIDOnChain(userAddress, didURI) {
  const tx = await DIDRegistry.registerDID(userAddress, didURI);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

export async function revokeDIDOnChain(userAddress) {
  const tx = await DIDRegistry.revokeDID(userAddress);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

export async function getDIDOnChain(userAddress) {
  return await DIDRegistry.getDID(userAddress);
}

export async function anchorCredentialOnChain(credentialHash) {
  const tx = await CredentialRegistry.anchorCredential(credentialHash);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

export async function revokeCredentialOnChain(credentialHash) {
  const tx = await CredentialRegistry.revokeCredential(credentialHash);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

export async function isCredentialValidOnChain(credentialHash) {
  return await CredentialRegistry.isValid(credentialHash);
}

export async function registerIssuerOnChain(issuerAddress, metadataURI) {
  const tx = await IssuerRegistry.addIssuer(issuerAddress, metadataURI);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

export async function isOnChainIssuer(issuerAddress) {
  return await IssuerRegistry.isRegistered(issuerAddress);
}

export async function getRecord(vcHash) {
  const record = await CredentialRegistry.getRecord(vcHash);
  return {
    issuer: record[0],
    issuedAt: Number(record[1]), // <- on-chain might be BigNumber
    revoked: record[2],
    revokedAt: Number(record[3]), // <- convert to number
  };
}

export async function isVCRevoked(vcHash) {
  return await CredentialRegistry.isRevoked(vcHash);
}
