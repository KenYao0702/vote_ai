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
        "0xe9dbd00767eef0e147dce36d0c2ffffffb8ecba9edeaad63f5ce7aa738c2c3a6"  // 替換為你的 Ganache 帳戶私鑰   
      ]
    }
  }
};
