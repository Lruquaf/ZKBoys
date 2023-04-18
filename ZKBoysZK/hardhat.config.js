require("@matterlabs/hardhat-zksync-deploy")
require("@matterlabs/hardhat-zksync-solc")
require("@matterlabs/hardhat-zksync-verify")
require("dotenv").config()

module.exports = {
    zksolc: {
        version: "1.3.5",
        compilerSource: "binary",
        settings: {},
    },
    defaultNetwork: "zkMainnet",
    networks: {
        zkTestnet: {
            url: "https://zksync2-testnet.zksync.dev", // URL of the zkSync network RPC
            ethNetwork: "goerli", // Can also be the RPC URL of the Ethereum network (e.g. `https://goerli.infura.io/v3/<API_KEY>`)
            zksync: true,
            verifyURL:
                "https://zksync2-testnet-explorer.zksync.dev/contract_verification",
            gasLimit: 8_000_000,
        },
        zkMainnet: {
            url: "https://mainnet.era.zksync.io", // URL of the zkSync network RPC
            ethNetwork: "ethereum", // Can also be the RPC URL of the Ethereum network (e.g. `https://goerli.infura.io/v3/<API_KEY>`)
            zksync: true,
            verifyURL:
                "https://zksync2-mainnet-explorer.zksync.io/contract_verification",
            gasLimit: 8_000_000,
        },
    },
    solidity: {
        version: "0.8.8",
    },
}
