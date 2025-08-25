import ether from ether
import path from path
import fs from fs;
try {
    
    const contractPath=path.join(__dirname,"../config/contract.json");
    const contract=JSON.parse(fs.readFileSync(contractPath));
} catch (error) {
    console.warn("Contract file not found. Please deploy the contracts first.");
}

const provider=new ether.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);

export async function isOnChainIssuer(address){
    try {
        const c=contract.issuerRegistry;
        const result=await provider.call(c.isOnChainIssuer(address));
        return result;
    } catch (error) {
        console.error("Error checking on-chain issuer:", error);
        throw error;
    }
}


