const {ethers} = require("ethers");
const contracts = require("./contracts.jason"); // genrates by deploy script
require("dotenv").config();

const provide = new ethers.JsonRpcProvider(process.env.RPC_URL);

