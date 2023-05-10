require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.16",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
    goerli: {
      url: "https://goerli.infura.io/v3/55f2ce4619854e19a0dffe079d430797",
      accounts: [
        "49e653bcb4b0e4c4a822ee01758668b399115e6f77fe2c078b8463234d4cda54",
      ],
    },
    bnbtestnet: {
      url: "https://data-seed-prebsc-2-s2.binance.org:8545",
      accounts: [
        "2050e9c2610b3cfa0c641206da720cd67ed97aab7e5619d38b411e8801f5569d",
      ],
      // gasPrice: 70000000000,
      chainId: 97,
    },
  },
};
