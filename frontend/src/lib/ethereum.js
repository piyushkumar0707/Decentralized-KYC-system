// frontend: metamask signer. USE FROM YOUR REACT/next.js app

import {ethers} from ("ethers");
import contracts from "../config/contract.json";

export   const EXPECTED_CHAIN_ID = 80002;

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
    
 }

