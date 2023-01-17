//this is where we will propose on the governor contract
const { network } = require("hardhat")
const {
    NEW_STORE_VALUE,
    FUNC,
    PROPOSAL_DESCTIPTION,
    developmentChains,
    VOTING_DELAY,
    PROPOSALS_FILE,
} = require("../helper-hardhat-config")

const fs = require("fs")

const { moveBlocks } = require("../utlis/move-blocks")
async function propose(args, functionToCall, proposalDescription) {
    const governor = await ethers.getContract("GovernorContract")
    const box = await ethers.getContract("Box")
    const chainId = network.config.chainId.toString()

    //we need to encode function and paraemeters
    //encodeFunctionData(functionToCall, args)
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
    console.log(encodedFunctionCall)

    //create proposal describtion
    console.log(`Proposing ${functionToCall} on ${box.address} wit ${args}`)
    console.log(`Proposal Description: \n ${proposalDescription}`)

    const proposeTx = await governor.propose(
        [box.address], //list of targets
        [0],
        [encodedFunctionCall], //list of encodede function call
        proposalDescription
    )

    const proposeReceipt = await proposeTx.wait(1)

    //since we have a voting delay and were testing on a local block chain we need to manually speed things up
    if (developmentChains.includes(network.name)) {
        moveBlocks(VOTING_DELAY + 1)
    }

    //this is how we get proposal id
    const proposalId = proposeReceipt.events[0].args.proposalId
    console.log(`Proposed with proposal ID: ${proposalId}`)

    const proposalState = await governor.state(proposalId)
    const proposalSnapShot = await governor.proposalSnapshot(proposalId)
    const proposalDeadline = await governor.proposalDeadline(proposalId)

    // save the proposalId in JSON
    let proposals = JSON.parse(fs.readFileSync(PROPOSALS_FILE, "utf8"))
    fs.writeFileSync(PROPOSALS_FILE, JSON.stringify({ [chainId]: [proposalId.toString()] }))

    // The state of the proposal. 1 is not passed. 0 is passed.
    console.log(`Current Proposal State: ${proposalState}`)
    // What block # the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
    // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`)

    if (developmentChains.includes(network.name)) {
        moveBlocks(VOTING_DELAY + 1)
    }
}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCTIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
