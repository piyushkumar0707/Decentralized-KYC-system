require("@nomiclabs/hardhat-ethers");
require("dotenv").config();
const { PRIVATE_KEY, POLYGON_RPC } = process.env;
module.exports = {
  solidity: {
    version: "0.8.30",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    hardhat: {},
    polygon: {
      url: process.env.RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
