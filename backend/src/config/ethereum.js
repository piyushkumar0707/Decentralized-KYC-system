const {ethers} = require("ethers");
const contracts = require("./contracts.json"); // genrates by deploy script
const path = require("path");
const { isError } = require("util");
require("dotenv").config();

const RPC_URL = process.env.RPC_URL;
if(!RPC_URL){
    throw new Error("Missing RPC_URL"); 
}
const provide = new ethers.JsonRpcProvider(process.env.RPC_URL);

function _resolve(nameOrObj){ // contract input can be in string "issuerRegistry " form or in object form "address + abi"
    if(typeof nameOrObj === "string"){
        if(!contracts[nameOrObj]){
            throw Error (`contract.json has no key ${nameOrObj}`);
        }
        return contracts[nameOrObj];
    }
    if(!nameOrObj?.adress || !nameOrObj?.abi){ // this will ensure custom object it actually has both address ,abi
        throw Error(`makeReadContract requires {adress , abi}`);
    }
    return nameOrObj;
}
//The issuer uses MetaMask to call a write function like registerDID(address user, string memory didData).
//The user doesn’t write anything.
//But your frontend can call getDID(userAddress) and show them their DID data (name, DOB, ID, etc.) on the screen.

function makeReadContract(nameOrObj){// it gives the safe gateway to reqad blockchain state uswer will only read the 
    const { address ,abi} = _resolve(nameOrObj);
    return new ethers.Contract(address ,abi , provider);
}
// using pre wired = already connected, already configured, ready to use instances so when fetching the data in backend  we don't have to everytime call to read the contract 

const issuerRegistry = makeReadContract("issuerRegistry");
const didRegistry = makeReadContract("didRegistry");
const credentialRegistry = makeReadContract("credentialRegistry");

module.exports ={
    provider,
    makeReadContract,
    issuerRegistry,
    didRegistry,
    credentialRegistry,
    address :{
        issuerRegistry : contracts.issuerRegistry?.address,
        didRegistry : contracts.didRegistry?.address,
        credentialRegistry : contracts.credentialRegistry?.address
    },
};