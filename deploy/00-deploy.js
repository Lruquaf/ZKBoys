const {network} = require("hardhat")
const {verify} = require("../utils/verify")
const {developmentChains} = require("../helper-hardhat-config")

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()

    const baseUri =
        "ipfs://bafybeigvqrne673cdiq32yqh2jfvesp76kdzc4svuyuztoczgawhgpmbue"
    const args = [baseUri]

    const zkBoys = await deploy("ZKBoys", {
        contract: "ZKBoys",
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.SEPOLIA_ETHERSCAN_API_KEY
    ) {
        await verify(zkBoys.address, args)
    }

    log("--------------------------------------------------------------")
}

module.exports.tags = ["all", "mocks", "zkBoys"]
