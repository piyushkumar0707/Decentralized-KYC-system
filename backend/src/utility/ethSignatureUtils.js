import { ethers } from "ethers";
import { getSigner, getIssuerSigner } from "../Services/ethereumServices.js";

export async function signMessage(message) {
    const signer = getIssuerSigner(true); // Fetches wallet signer (metamask)
    return await signer.signMessage(message); // A long hexadecimal string (digital signature)
}

// Verifying signature
export function verifyMessage(message, signature) {
    try {
        return ethers.utils.verifyMessage(message, signature); // Returns the signer address
    } catch (err) {
        throw new Error("Invalid signature");
    }
}

export async function signDID(didURI) {
    const signer = getIssuerSigner(true); // Issuer's signer (wallet)
    const message = `Register DID:${didURI}`;
    const signature = await signer.signMessage(message);

    return {
        didURI, // DID being registered
        signature, // Signature by issuer 
        signer: await signer.getAddress(), // Issuer's Address
    };
}

export function verifyDID(didURI, signature) {
    // FIX: The message for verification must match the message for signing.
    // The original code had a typo: "Registry DID:" instead of "Register DID:".
    const message = `Register DID:${didURI}`;
    return ethers.verifyMessage(message, signature); // Returns signer address
}
        
/*Hash Helpers
    Use hashing to store/compare data securely without exposing
    raw values (like emails, Aadhaar, phone, etc.)
*/
// keccak256 is cryptographic hash function
export function hashData(data) {
    return ethers.keccak256(ethers.toUtf8Bytes(data));
}
