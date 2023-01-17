const { network } = require("hardhat")

const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utlis/verify")
const { MIN_DELAY, ZERO_ADDRESS } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAcounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("---------")

    //time lock does take some arguements
    //1st) min delay
    //2nd) list of purposals
    //3) list of
    const timeLock = await ethers.getContract("TimeLock", deployer)
    const governor = await ethers.getContract("GovernorContract", deployer)
    console.log("Setting up roles...")
    //setting up rolls so only the certain role can propose or executor
    //right now the deployer is the admin

    const proposerRole = await timeLock.PROPOSER_ROLE()
    const executorRole = await timeLock.EXECUTOR_ROLE()
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE()

    //techniqually deployer has admin role thats why they can grant roles
    const proposerTx = await timeLock.grantRole(proposerRole, governor.address)
    await proposerTx.wait(1)

    //giving this ROLE TO NO ONE (aka everyone)
    const executorTx = await timeLock.grantRole(executorRole, ZERO_ADDRESS)
    await executorTx.wait(1)

    //but now that we set up roles lets revoke admin from deployer
    const revokeTx = await timeLock.revokeRole(adminRole, deployer)
    await revokeTx.wait(1)

    //so now anything the timelock controller wants to do has to go thru governance contract
}
