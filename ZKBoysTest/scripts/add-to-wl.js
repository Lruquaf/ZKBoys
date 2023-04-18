const {getNamedAccounts, ethers} = require("hardhat")

async function main() {
    const {deployer} = await getNamedAccounts()
    const zkBoys = await ethers.getContract("ZKBoys", deployer)
    console.log("Adding a wl address...")
    let txResponse = await zkBoys.addToWhitelist(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    )
    await txResponse.wait(1)
    console.log("Address added!")

    console.log("Adding a few wl addresses...")
    txResponse = await zkBoys.addToWhitelistBatch([
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    ])
    await txResponse.wait(1)
    console.log("Addresses added!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
