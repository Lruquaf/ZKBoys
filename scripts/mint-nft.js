const {getNamedAccounts, ethers} = require("hardhat")

async function main() {
    const {deployer} = await getNamedAccounts()
    const zkBoys = await ethers.getContract("ZKBoys", deployer)

    const iswl = await zkBoys.isWhitelisted(
        "0xC85C392654B161E9a16f8f8766Db5E75620dD276"
    )
    console.log(iswl)

    console.log("Minting NFTs by a wl address...")
    let txResponse = await zkBoys.mintForWhitelist(4, {gasLimit: 30000000})
    await txResponse.wait(1)
    console.log("NFTs were minted by a wl address!")

    // console.log("Minting NFTs by an address...")
    // txResponse = await zkBoys.mintForPublic(3, {gasLimit: 5000000})
    // console.log("3 NFTs were minted!")

    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
