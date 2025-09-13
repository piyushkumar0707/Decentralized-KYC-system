import {ethers} from "ethers";
import contracts from "//migrationsDeployment/contracts.json" assert { type: "json" };

const RPC_URL=process.env.BLOCKCHAIN_RPC_URL;
if(!RPC_URL) throw new Error("BLOCKCHAIN_RPC_URL not set in env");
const provider=new ethers.JsonRpcProvider(RPC_URL);

function _resolve(nameOrObj){
    if(typeof nameOrObj==="string"){
   if(!contracts[nameOrObj]) throw Error(`contracts.json missing key: ${nameOrObj}`);
    return contracts[nameOrObj];
   
}
if(!nameOrObj?.address || !nameOrObj.abi){
    throw Error(`makeReadContract requires { address, abi }`);

}
return nameOrObj;
}

export function makeReadContract(nameOrObj){
    const {address,abi}=_resolve(nameOrObj);
    return new ethers.Contract(address,abi,provider);
}

export const issuerRegister