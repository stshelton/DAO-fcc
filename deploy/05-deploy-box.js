const { network } = require("hardhat")

const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utlis/verify")
const {
    MIN_DELAY,
    VOTING_DELAY,
    VOTING_PERIOD,
    QUORUM_PERCENTAGE,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAcounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("---------")
    log("deploying box...")

    //right now the deployer is the owner of box contract but we want the timelock to be the owner
    const box = await deploy("Box", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations,
    })

    const timeLock = await ethers.getContract("TimeLock")
    const boxContract = await ethers.getContract("Box")

    const transferOwnerTx = await boxContract.transferOwnership(timeLock.address)
    await transferOwnerTx.wait(1)

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying ....")
        await verify(box.address, args)
    }

    console.log("----------")
}
