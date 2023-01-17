const { network } = require("hardhat")

const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utlis/verify")

module.exports = async ({ getNamedAcounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("---------")
    const gToken = await deploy("GovernanceToken", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying ....")
        await verify(boxv2.address, args)
    }

    console.log(`deployed contract at address ${gToken.address}`)
    await delegate(gToken.address, deployer)
    console.log("----------")
}

//how to give someone ur votes (tokens)
const delegate = async function (governanceTokenaddress, delegatedAccount) {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenaddress)
    const tx = await governanceToken.delegate(delegatedAccount)
    await tx.wait(1)
    console.log(`Checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`)
}
