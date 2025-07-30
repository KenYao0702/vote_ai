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
        "0xc79759ba8a6f2338eb8d70f2d5fb06c20fd4005ad6c78c207368b122fce9ac87"
      ]
    }
  }
};
