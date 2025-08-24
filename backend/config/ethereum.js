const {ethers} = require("ethers");
const contracts = require("./contracts.jason"); // genrates by deploy script
const path = require("path");
require("dotenv").config();

const RPC_URL = process.env.RPC_URL;
if(!RPC_URL){
    throw new Error("Missing RPC_URL"); 
}
const provide = new ethers.JsonRpcProvider(process.env.RPC_URL);

