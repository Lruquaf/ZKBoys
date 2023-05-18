require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia"
const SEPOLIA_ETHERSCAN_API_KEY = process.env.SEPOLIA_ETHERSCAN_API_KEY || "key"
const ZKSYNC2_RPC_URL = process.env.ZKSYNC2_RPC_URL || "http://zksync2"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key"

module.exports = {
    solidity: "0.8.8",
    zksolc: {
        version: "1.3.5",
        compilerSource: "binary",
        settings: {},
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
            gas: 2100000,
            gasPrice: 8000000000,
        },
        zkTestnet: {
            chainId: 280,
            blockConfirmations: 6,
            url: ZKSYNC2_RPC_URL,
            ethNetwork: "goerli",
            zksync: true,
            accounts: [PRIVATE_KEY],
        },
        sepolia: {
            chainId: 11155111,
            blockConfirmations: 6,
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            wl1: 1,
            wl2: 2,
            wl3: 3,
            normal: 4,
            normal: 5,
            normal: 6,
            normal: 7,
            normal: 8,
            normal: 9,
            normal: 10,
        },
    },
    etherscan: {
        apiKey: {
            sepolia: SEPOLIA_ETHERSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
    },
}
