// this will manage the connection to metamask/provider contract interations and network handling
/*
So why have ethereumService.js at all?
The reason developers still create ethereumService.js is to centralize all
blockchain logic into one file,
so your frontend UI doesn’t directly handle low-level Web3/ethers.js stuff.
*/

import { ethers } from "ethers";
import contracts from "./contracts.json"; // auto-generated after deploy (contains abi + address)

const EXPECTED_CHAIN_ID = 137; // Polygon Mainnet (change to 80001 for Mumbai testnet)

// -------------------- Provider & Signer --------------------
export function getBrowserProvider() {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask not installed. Please install it.");
  }
  return new ethers.BrowserProvider(window.ethereum);
}
export function getIssuerSigner() {
  const privateKey = process.env.ISSUER_PRIVATE_KEY; 
  if (!privateKey) throw new Error("Missing ISSUER_PRIVATE_KEY in .env");
  return new ethers.Wallet(privateKey, provider);
}

export async function getSigner(requestAccounts = false) {
  const provider = getBrowserProvider();
  if (requestAccounts) {
    await provider.send("eth_requestAccounts", []);
  }
  return await provider.getSigner();
}

// -------------------- Network Check --------------------
export async function ensureExpectedNetwork(provider) {
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);
  if (EXPECTED_CHAIN_ID && chainId !== EXPECTED_CHAIN_ID) {
    try {
      // Ask MetaMask to switch
      await provider.send("wallet_switchEthereumChain", [
        { chainId: ethers.toBeHex(EXPECTED_CHAIN_ID) },
      ]);
    } catch (err) {
      throw new Error(
        `Please switch MetaMask to chain ID ${EXPECTED_CHAIN_ID}. Current chain: ${chainId}`
      );
    }
  }
}

// -------------------- Contract Resolver --------------------
function resolveContract(nameOrObj) {
  if (typeof nameOrObj === "string") {
    if (!contracts[nameOrObj]) {
      throw new Error(`contracts.json has no key "${nameOrObj}"`);
    }
    return contracts[nameOrObj];
  }
  if (!nameOrObj?.address || !nameOrObj?.abi) {
    throw new Error("getContract requires { address, abi }");
  }
  return nameOrObj;
}

export function getReadContract(nameOrObj, provider) {
  const { address, abi } = resolveContract(nameOrObj);
  const p = provider || getBrowserProvider();
  return new ethers.Contract(address, abi, p);
}

export async function getWriteContract(nameOrObj) {
  const { address, abi } = resolveContract(nameOrObj);
  const signer = await getSigner(true);
  return new ethers.Contract(address, abi, signer);
}

// -------------------- Pre-wired Registry Helpers --------------------
export function issuerRegistryRead(provider) {
  return getReadContract("issuerRegistry", provider);
}
export function didRegistryRead(provider) {
  return getReadContract("didRegistry", provider);
}
export function credentialRegistryRead(provider) {
  return getReadContract("credentialRegistry", provider);
}

export async function issuerRegistryWrite() {
  return getWriteContract("issuerRegistry");
}
export async function didRegistryWrite() {
  return getWriteContract("didRegistry");
}
export async function credentialRegistryWrite() {
  return getWriteContract("credentialRegistry");
}
