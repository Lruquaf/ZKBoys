const {assert, expect} = require("chai")
const {deployments, ethers, getNamedAccounts, network} = require("hardhat")
const {developmentChains} = require("../helper-hardhat-config")

!developmentChains.includes(network.name) ? describe.skip :
describe("ZKBoys", async function () {
    let zkBoys
    let deployer
    let attacker, wl1, wl2, wl3, pub1, pub2, pub3, pub4

    const tokenPrice = ethers.utils.parseEther("0.0015")
    const testTime1 = 1681635600
    const testTime2 = 1681722000
    const testTime3 = 1681981200
    const testTime4 = 1682067600
    const baseUri =
        "ipfs://bafybeigvqrne673cdiq32yqh2jfvesp76kdzc4svuyuztoczgawhgpmbue"

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        zkBoys = await ethers.getContract("ZKBoys", deployer)
        const accounts = await ethers.getSigners()
        owner = accounts[0]
        attacker = accounts[2]
        wl1 = accounts[3]
        wl2 = accounts[4]
        wl3 = accounts[5]
        pub1 = accounts[6]
        pub2 = accounts[7]
        pub3 = accounts[8]
        pub4 = accounts[9]
    })

    describe("constructor", async function () {
        it("sets the baseURI correctly", async function () {
            const response = await zkBoys.baseURI()
            assert.equal(response, baseUri)
        })
    })

    describe("whitelist", async function () {
        it("owner can set a wl address", async function () {
            await zkBoys.addToWhitelist(wl2.address)
            response1 = await zkBoys.isWhitelisted(wl2.address)
            response2 = await zkBoys.isWhitelisted(wl1.address)
            assert.equal(response1, true)
            assert.equal(response2, false)
        })
        it("fails if another address try to set a wl", async function () {
            const attackerConnectedContract = await zkBoys.connect(attacker)
            await expect(
                attackerConnectedContract.addToWhitelist(attacker.address)
            ).to.be.revertedWith("Ownable: caller is not the owner")
        })
        it("owner can set a batch of wl addresses", async function () {
            await zkBoys.addToWhitelistBatch([wl1.address, wl2.address])
            response1 = await zkBoys.isWhitelisted(wl1.address)
            response2 = await zkBoys.isWhitelisted(wl2.address)
            assert.equal(response1, true)
            assert.equal(response2, true)
        })
        it("fails if another address try to set a batch of wl", async function () {
            const attackerConnectedContract = await zkBoys.connect(attacker)
            await expect(
                attackerConnectedContract.addToWhitelistBatch([
                    wl1.address,
                    wl2.address,
                ])
            ).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })

    describe("minting", async function () {
        beforeEach(async function () {
            await zkBoys.addToWhitelistBatch([
                wl1.address,
                wl2.address,
                wl3.address,
            ])
        })
        describe("time testing", async function () {
            it("fails if an address try to mint for wl before the wl time", async function () {
                await zkBoys.setMintTime(testTime3, testTime4)
                const wl1ConnectedContract = await zkBoys.connect(wl1)
                const pub1ConnectedContract = await zkBoys.connect(pub1)
                await expect(
                    wl1ConnectedContract.mintForWhitelist("1")
                ).to.be.revertedWithCustomError(
                    wl1ConnectedContract,
                    "WLSaleNotStarted"
                )
                await expect(
                    pub1ConnectedContract.mintForWhitelist("2")
                ).to.be.revertedWithCustomError(
                    pub1ConnectedContract,
                    "WLSaleNotStarted"
                )
            })
            it("fails if an address try to mint for wl after the wl time", async function () {
                await zkBoys.setMintTime(testTime1, testTime2)
                const wl1ConnectedContract = await zkBoys.connect(wl1)
                const pub1ConnectedContract = await zkBoys.connect(pub1)
                await expect(
                    wl1ConnectedContract.mintForWhitelist("2")
                ).to.be.revertedWithCustomError(
                    wl1ConnectedContract,
                    "WLSaleHasEnded"
                )
                await expect(
                    pub1ConnectedContract.mintForWhitelist("3")
                ).to.be.revertedWithCustomError(
                    pub1ConnectedContract,
                    "WLSaleHasEnded"
                )
            })
            it("fails if an address try to mint for public before the public time", async function () {
                await zkBoys.setMintTime(testTime3, testTime4)
                const wl1ConnectedContract = await zkBoys.connect(wl1)
                const pub1ConnectedContract = await zkBoys.connect(pub1)
                await expect(
                    wl1ConnectedContract.mintForPublic("10")
                ).to.be.revertedWithCustomError(
                    wl1ConnectedContract,
                    "PublicSaleNotStarted"
                )
                await expect(
                    pub1ConnectedContract.mintForPublic("2")
                ).to.be.revertedWithCustomError(
                    pub1ConnectedContract,
                    "PublicSaleNotStarted"
                )
            })
            it("fails if an address try to mint for public between wl and public time", async function () {
                await zkBoys.setMintTime(testTime2, testTime3)
                const wl1ConnectedContract = await zkBoys.connect(wl1)
                const pub1ConnectedContract = await zkBoys.connect(pub1)
                await expect(
                    wl1ConnectedContract.mintForPublic("22")
                ).to.be.revertedWithCustomError(
                    wl1ConnectedContract,
                    "PublicSaleNotStarted"
                )
                await expect(
                    pub1ConnectedContract.mintForPublic("31")
                ).to.be.revertedWithCustomError(
                    pub1ConnectedContract,
                    "PublicSaleNotStarted"
                )
            })
        })
        describe("wl mint", async function () {
            beforeEach(async function () {
                await zkBoys.setMintTime(testTime2, testTime3)
                // const wl2ConnectedContract = await zkBoys.connect(wl2)
                // const wl3ConnectedContract = await zkBoys.connect(wl3)
            })
            it("any wl address can mint in wl", async function () {
                const wl1ConnectedContract = await zkBoys.connect(wl1)
                await wl1ConnectedContract.mintForWhitelist("2")
                response1 = await zkBoys.balanceOf(wl1.address)
                assert.equal(response1, 2)
                response2 = await zkBoys.tokenSupply()
                assert.equal(response2, 2)
                response3 = await zkBoys.idCounter()
                assert.equal(response3, 3)
                response4 = await zkBoys.wlAddressToTokenAmounts(wl1.address)
                assert.equal(response4, 2)
            })
            it("fails if a non-wl address try to mint in wl", async function () {
                const pub1ConnectedContract = await zkBoys.connect(pub1)
                await expect(
                    pub1ConnectedContract.mintForWhitelist("1")
                ).to.be.revertedWithCustomError(
                    pub1ConnectedContract,
                    "NotEligibleAddressForWL"
                )
            })
            it("fails if a wl address try to mint more than wl limit per address", async function () {
                const wl1ConnectedContract = await zkBoys.connect(wl1)
                await wl1ConnectedContract.mintForWhitelist("1")
                await expect(
                    wl1ConnectedContract.mintForWhitelist("2")
                ).to.be.revertedWithCustomError(
                    wl1ConnectedContract,
                    "WLAmountLimitExceeded"
                )
            })
            it("fails if max supply for wl mint exceeds", async function () {
                const wl1ConnectedContract = await zkBoys.connect(wl1)
                const wl2ConnectedContract = await zkBoys.connect(wl2)
                const wl3ConnectedContract = await zkBoys.connect(wl3)
                await wl1ConnectedContract.mintForWhitelist("2")
                await wl2ConnectedContract.mintForWhitelist("1")
                await expect(
                    wl3ConnectedContract.mintForWhitelist("2")
                ).to.be.revertedWithCustomError(
                    wl3ConnectedContract,
                    "SupplyLimitForWLExceeded"
                )
            })
        })
        describe("public mint", async function () {
            beforeEach(async function () {
                await zkBoys.setMintTime(testTime1, testTime2)
            })
            it("any address can mint in public", async function () {
                const pub1ConnectedContract = await zkBoys.connect(pub1)
                const wl2ConnectedContract = await zkBoys.connect(wl2)
                await pub1ConnectedContract.mintForPublic("1", {
                    value: tokenPrice * 1,
                })
                await wl2ConnectedContract.mintForPublic("3", {
                    value: tokenPrice * 3,
                })
                response1 = await zkBoys.balanceOf(pub1.address)
                assert.equal(response1, 1)
                response2 = await zkBoys.addressToTokenAmounts(pub1.address)
                assert.equal(response2, 1)
                response3 = await zkBoys.balanceOf(wl2.address)
                assert.equal(response3, 3)
                response4 = await zkBoys.addressToTokenAmounts(wl2.address)
                assert.equal(response4, 3)
                response5 = await zkBoys.tokenSupply()
                assert.equal(response5, 4)
                response6 = await zkBoys.idCounter()
                assert.equal(response6, 5)
            })
            it("fails if an address try to mint more than public limit per address", async function () {
                const pub1ConnectedContract = await zkBoys.connect(pub1)
                await pub1ConnectedContract.mintForPublic("2", {
                    value: tokenPrice * 2,
                })
                await expect(
                    pub1ConnectedContract.mintForPublic("2", {
                        value: tokenPrice * 2,
                    })
                ).to.be.revertedWithCustomError(
                    pub1ConnectedContract,
                    "PublicAmountLimitExceeded"
                )
            })
            it("fails if max supply exceeds", async function () {
                const pub1ConnectedContract = await zkBoys.connect(pub1)
                const pub2ConnectedContract = await zkBoys.connect(pub2)
                const pub3ConnectedContract = await zkBoys.connect(pub3)
                const pub4ConnectedContract = await zkBoys.connect(pub4)
                await pub1ConnectedContract.mintForPublic("3", {
                    value: tokenPrice * 3,
                })
                await pub2ConnectedContract.mintForPublic("3", {
                    value: tokenPrice * 3,
                })
                await pub3ConnectedContract.mintForPublic("3", {
                    value: tokenPrice * 3,
                })
                await expect(
                    pub4ConnectedContract.mintForPublic("2", {
                        value: tokenPrice * 2,
                    })
                ).to.be.revertedWithCustomError(
                    pub4ConnectedContract,
                    "SupplyLimitExceeded"
                )
            })
            it("fails if value is not equal total amount of ETH", async function () {
                const pub1ConnectedContract = await zkBoys.connect(pub1)
                await expect(
                    pub1ConnectedContract.mintForPublic("2", {
                        value: tokenPrice * 1,
                    })
                ).to.be.revertedWithCustomError(
                    pub1ConnectedContract,
                    "NotEnoughETH"
                )
                await expect(
                    pub1ConnectedContract.mintForPublic("2", {
                        value: tokenPrice * 3,
                    })
                ).to.be.revertedWithCustomError(
                    pub1ConnectedContract,
                    "NotEnoughETH"
                )
            })
        })
    })
    describe("withdraw", async function () {
        beforeEach(async function () {
            await zkBoys.setMintTime(testTime1, testTime2)
            const pub1ConnectedContract = await zkBoys.connect(pub1)
            await pub1ConnectedContract.mintForPublic("3", {
                value: tokenPrice * 3,
            })
        })
        it("fails if attacker try to withdraw funds", async function () {
            const attackerConnectedContract = await zkBoys.connect(attacker)
            await expect(
                attackerConnectedContract.withdraw()
            ).to.be.revertedWith("Ownable: caller is not the owner")
        })
        it("owner can withdraw the funds", async function () {
            const startingContractBalance = await zkBoys.provider.getBalance(
                zkBoys.address
            )
            const startingOwnerBalance = await zkBoys.provider.getBalance(
                deployer
            )

            const txResponse = await zkBoys.withdraw()
            const txReceipt = await txResponse.wait(1)
            const {gasUsed, effectiveGasPrice} = txReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingContractBalance = await zkBoys.provider.getBalance(
                zkBoys.address
            )
            const endingOwnerBalance = await zkBoys.provider.getBalance(
                deployer
            )

            assert.equal(endingContractBalance, 0)
            assert.equal(
                startingContractBalance.add(startingOwnerBalance).toString(),
                endingOwnerBalance.add(gasCost).toString()
            )
        })
    })
    describe("token uri", async function () {
        it("returns token uri when query with a token id", async function () {
            await zkBoys.setMintTime(testTime1, testTime2)
            const pub1ConnectedContract = await zkBoys.connect(pub1)
            await pub1ConnectedContract.mintForPublic("3", {
                value: tokenPrice * 3,
            })
            response = await zkBoys.tokenURI("2")
            assert.equal(response, baseUri + "2" + ".json")
        })
    })
})
