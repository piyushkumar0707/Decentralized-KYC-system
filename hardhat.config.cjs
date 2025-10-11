require("@nomiclabs/hardhat-ethers");
require("dotenv").config();
const { PRIVATE_KEY } = process.env;
module.exports = {
  solidity: {
    version: "0.8.30",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    hardhat: {},
    amoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  }
};
