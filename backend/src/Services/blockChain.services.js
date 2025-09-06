// import { ethers, JsonRpcProvider } from "ethers";
// import fs from "fs";
// import path from "path";
// import dotenv from "dotenv";
// dotenv.config();
// import { fileURLToPath } from "url";

// // ---------------------------
// // Setup paths for ES Modules
// // ---------------------------
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ---------------------------
// // Setup provider + signer
// // ---------------------------
// const provider = new JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
// export const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// // ---------------------------
// // Helper to load ABI + deployed address
// // ---------------------------
// function loadContract(name) {
//   // Load ABI from artifact
//   const artifactPath = path.join(__dirname, `../../../artifacts/contracts/${name}.sol`, `${name}.json`);
//   if (!fs.existsSync(artifactPath)) throw new Error("Artifact not found: " + artifactPath);
//   const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

//   // Load deployed address
//   const deploymentPath = path.join(__dirname, "../../../migrationsDeployment/deployments.json");
//   if (!fs.existsSync(deploymentPath)) throw new Error("Deployment file not found: " + deploymentPath);
//   const deployments = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));

//   const deployed = deployments[name];
//   if (!deployed ) throw new Error(`No address found for ${name} in migrationsDeployment.json`);

//   return { abi: artifact.abi, address: deployed.name };
// }

// // ---------------------------
// // Load Contracts
// // ---------------------------
// const DID = loadContract("DIDRegistry");
// const Issuer = loadContract("IssuerRegistry");
// const Credential = loadContract("CredentialRegistry");

// export const DIDRegistry = new ethers.Contract(DID.address, DID.abi, signer);
// export const IssuerRegistry = new ethers.Contract(Issuer.address, Issuer.abi, signer);
// export const CredentialRegistry = new ethers.Contract(Credential.address,Credential.abi, signer);

// // ---------------------------
// // Issuer Verification Wrapper
// // ---------------------------
// async function ensureIssuer(address) {
//   const isIssuer = await IssuerRegistry.isIssuer(address);
//   if (!isIssuer) throw new Error(`Address ${address} is not a registered issuer`);
//   return true;
// }

// // ---------------------------
// // DID Registry Operations
// // ---------------------------
// export async function registerDIDOnChain(userAddress, didURI) {
//   await ensureIssuer(await signer.getAddress()); // verify caller is an issuer
//   const tx = await DIDRegistry.registerDID(userAddress, didURI);
//   const receipt = await tx.wait();
//   return receipt.transactionHash;
// }

// export async function issuerRevokeDIDOnChain(userAddress, reason) {
//   await ensureIssuer(await signer.getAddress()); // verify caller is an issuer
//   const tx = await DIDRegistry.issuerRevokeDID(userAddress, reason);
//   const receipt = await tx.wait();
//   return receipt.transactionHash;
// }

// export async function getDIDOnChain(userAddress) {
//   return await DIDRegistry.getDID(userAddress);
// }

// // ---------------------------
// // Credential Registry Operations
// // ---------------------------
// export async function anchorCredentialOnChain(vcHash) {
//   await ensureIssuer(await signer.getAddress());
//   const tx = await CredentialRegistry.anchorCredential(vcHash);
//   const receipt = await tx.wait();
//   return receipt.transactionHash;
// }

// export async function revokeCredentialOnChain(vcHash) {
//   await ensureIssuer(await signer.getAddress());
//   const tx = await CredentialRegistry.revokeCredential(vcHash);
//   const receipt = await tx.wait();
//   return receipt.transactionHash;
// }

// export async function getRecord(vcHash) {
//   const record = await CredentialRegistry.getRecord(vcHash);
//   return {
//     issuer: record[0],
//     issuedAt: Number(record[1]),
//     revoked: record[2],
//     revokedAt: Number(record[3]),
//   };
// }

// export async function isVCRevoked(vcHash) {
//   return await CredentialRegistry.isRevoked(vcHash);
// }

// // ---------------------------
// // Issuer Checks
// // ---------------------------
// export async function isOnChainIssuer(address) {
//   return await IssuerRegistry.isIssuer(address);
// }

import pkg from "ethers";
const { ethers, providers } = pkg;

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

// ----------------- Setup Provider + Signer -----------------
const provider = new providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545");
export const signer = new ethers.Wallet(process.env.PRIVATE_KEY || ethers.Wallet.createRandom().privateKey, provider);

// ----------------- Helpers -----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadContract(name) {
  const deploymentPath = path.join(__dirname, "../../../migrationsDeployment/deployments.json");

  if (!fs.existsSync(deploymentPath)) {
    console.warn(`[MOCK] Deployment file not found. Using mock for ${name}`);
    return { mock: true, name };
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  if (!deployments[name]) {
    console.warn(`[MOCK] No deployment info for ${name}. Using mock.`);
    return { mock: true, name };
  }

  return deployments[name];
}

function createContract(info) {
  if (info.mock || !info.address || !info.abi) {
    return { mock: true, name: info.name || "UnknownContract" };
  }
  return new ethers.Contract(info.address, info.abi, signer);
}

// ----------------- Load Contracts -----------------
const DID = loadContract("DIDRegistry");
const Issuer = loadContract("IssuerRegistry");
const Credential = loadContract("CredentialRegistry");

export const DIDRegistry = createContract(DID);
export const IssuerRegistry = createContract(Issuer);
export const CredentialRegistry = createContract(Credential);

// ----------------- Wrappers -----------------
export async function registerDIDOnChain(userAddress, didURI) {
  if (DIDRegistry.mock) {
    console.log(`[MOCK] registerDID(${userAddress}, ${didURI})`);
    return "0xmocktxhash";
  }
  const tx = await DIDRegistry.registerDID(userAddress, didURI);
  return (await tx.wait()).transactionHash;
}

export async function issuerRevokeDIDOnChain(userAddress, reason) {
  if (DIDRegistry.mock) {
    console.log(`[MOCK] issuerRevokeDID(${userAddress}, ${reason})`);
    return "0xmocktxhash";
  }
  const tx = await DIDRegistry.issuerRevokeDID(userAddress, reason);
  return (await tx.wait()).transactionHash;
}

export async function anchorCredentialOnChain(vcHash) {
  if (CredentialRegistry.mock) {
    console.log(`[MOCK] anchorCredential(${vcHash})`);
    return "0xmocktxhash";
  }
  const tx = await CredentialRegistry.anchorCredential(vcHash);
  return (await tx.wait()).transactionHash;
}

export async function revokeCredentialOnChain(vcHash) {
  if (CredentialRegistry.mock) {
    console.log(`[MOCK] revokeCredential(${vcHash})`);
    return "0xmocktxhash";
  }
  const tx = await CredentialRegistry.revokeCredential(vcHash);
  return (await tx.wait()).transactionHash;
}

export async function isOnChainIssuer(address) {
  if (IssuerRegistry.mock) {
    console.log(`[MOCK] isIssuer(${address})`);
    return true;
  }
  return await IssuerRegistry.isIssuer(address);
}

export async function getRecord(vcHash) {
  if (CredentialRegistry.mock) {
    console.log(`[MOCK] getRecord(${vcHash})`);
    return {
      issuer: "0xMockIssuer",
      issuedAt: Date.now(),
      revoked: false,
      revokedAt: 0,
    };
  }
  const record = await CredentialRegistry.getRecord(vcHash);
  return {
    issuer: record[0],
    issuedAt: Number(record[1]),
    revoked: record[2],
    revokedAt: Number(record[3]),
  };
}

export async function isVCRevoked(vcHash) {
  if (CredentialRegistry.mock) {
    console.log(`[MOCK] isRevoked(${vcHash})`);
    return false;
  }
  return await CredentialRegistry.isRevoked(vcHash);
}

export async function getDIDOnChain(userAddress) {
  if (DIDRegistry.mock) {
    console.log(`[MOCK] getDID(${userAddress})`);
    return "did:mock:" + userAddress;
  }
  return await DIDRegistry.getDID(userAddress);
}
