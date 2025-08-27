import{ethers} from "ethers";
import { getSigner } from "../Services/ethereumServices";

export async function signMessage(message){
    const signer = await getSigner(true);//fetches wallet signer(metamask)
    return await signer.signMessage(message);// a long hexadecimal string(digital signature)
}

// verifying signature
export function verifyMessage(message , signature){
    try{
        return ethers.verifyMessage(message, signature);// returns the signer address
    } catch(err){
        throw new Error("Invalid signature");
    }
}

export async function signDID(didURI){
    const signer = await getSigner(true);//issuer's signer(wallet)
    const message = `Register DID:${didURI}`;
    const signature = await signer.signMessage(message);

    return{
        didURI,// DID being registered
        signature,// signature by issuer 
        signer: await signer.getAddress(), // issuers  Address
    };
}

export function verifyDID(didURI, signture){
    const message = `Registry DID: ${didURI}`;
    return ethers.verifyMessage(message, signature); // returns signer address
}
        
/*Hash Helpers
   Use hashing to store/compare data securely without exposing
   raw values (like emails, Aadhaar, phone, etc.)
*/
//keccak256 is cryptographic hash function
export function hashData(data){
    return ethers.keccak256(ethers.toUtf8Bytes(data));
}

