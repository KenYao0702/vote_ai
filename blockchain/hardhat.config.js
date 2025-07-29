require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24", // 指定 Solidity 版本，與你的合約相符
  networks: {
    hardhat: {
      // 本地 Hardhat 網路，用於測試
    },
    ganache: {
      url: "http://127.0.0.1:8545", // Ganache 預設的 RPC URL
      accounts: [
        "0x5e60affb5e72b860ed8a9600cc4922f002f49bb8e5a87c4cee478fd530a843e8"
      ]
    }
  }
};
