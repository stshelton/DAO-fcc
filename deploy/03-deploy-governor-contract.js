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
    const gtoken = await ethers.getContract("GovernanceToken")
    const timeLock = await ethers.getContract("TimeLock")

    log("deploying governor")
    //time lock does take some arguements
    //1st) min delay
    //2nd) list of purposals
    //3) list of
    const gCONTRACT = await deploy("GovernorContract", {
        from: deployer,
        args: [gtoken.address, timeLock.address, VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE],
        log: true,
        waitConfirmations: network.config.blockConfirmations,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying ....")
        await verify(boxv2.address, args)
    }

    console.log("----------")
}
