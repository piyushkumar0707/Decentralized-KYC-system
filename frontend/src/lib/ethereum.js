// frontend: metamask signer. USE FROM YOUR REACT/next.js app

import {ethers} from ("ethers");
import contracts from "../config/contract.json";

export const EXPECTED_CHAIN_ID = 80002;

export function getBrowserProvider(){//basically this function ensures that the metamsk is installed
    if(typeof window === "undefined"){
        throw Error("getBrowserProvider must be called on the browser");
    }
    if(!window.ethereum){
        throw Error("metamask account not found . Please install MetaMask.");
    }
    return new ethers.BroserProvider(window.ethereum);//returns the browserProvider that talks to metamask
}

 export async function getSigner (requestAccounts = true){
    const provider = getBrowserProvider();
    if(requestAccounts){
        await provider.send("eth_requestAccount" , []);//provider is your connection to the blockchain
    }
    const signer = await provider.getSigner();//it means get the account connected to this provider and has the ability to sign the transactions
    await ensureExpectedNetwork(provider);//whether connected to the corrected network
    return signer;
  }
// this prevents the mistakes of sending the transaction on ethereum instead of polygon
  export async function ensureExpectedNetwork(provider){//gets the current network wallet is connected to
    const network = await provider.getNetwork();
    const chainId = Number(number.chainId);

    if(EXPECTED_CHAIN_ID && chainId != EXPECTED_CHAIN_ID){//compares the network to expected chain id
        try {
            await provider.send("wallet_switchEthereumChain", [ // if wrong tries to switch metamask with wallet_switchEthereumChain
                { chainId: ethers.toBeHex(EXPECTED_CHAIN_ID)},
            ]);
        }catch(err){
            throw new Error( // error if metamask don't have that account
                `Please switch Metamask to chain ID ${EXPECTED_CHAIN_ID}.CUreent chain: ${chainId}`
            );
        }
    }
  }
  // providing flexibility to take issuerRegistry pr address+abi object

function resolveContract(nameOrObject){
    if(typeof(nameOrObject === "string")){
        if(!contract[nameOrObject]){
            throw new Error(` contracts.json has no key "${nameOrObject}"`);
        }
        return contracts[nameOrObject];
    }
    if(!nameOrObject?.address|| !nameOrObject?.abi){
        throw new Error("getContract requires{address , abi}");
    }
    return nameOrObject;
}

export function getReadContract(nameOrObject , provider){
 const {address, abi} = resolveContract(nameOrObject);
 const p = provider || getBrowserProvider();
 return new ethers.Contract(address, abi, p);
}

export async function getWriteContract(nameOrObject){
    const{ address , abi} = resolveContract(nameOrObject);
    const signer = await getSigner(true);
    return new ethers.Contract(address ,abi , signer);

}
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
