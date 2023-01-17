# DAO's

## **D**ecentraalized <br>
## **A**utonomous <br>
## **O**rganization <br>


- Any group that is goverened by a transparent set of rules found on a block chain or smart contract

- DAO Solves an age old problem of trust, centrality and transparency, and giving the power to the users of different protocols and applications. Instaed of everything happening behind closed doors. And this voting piece is a cornerstone of how there operate this decentralized governance, if you will.

- Company/Organiztion that is operated exclusively through code

## Combound protocol
--------
The compound protocol is a borrowing and lending application that allows users to borrow and lend their assests.
- everything in this applicaiton is built in smart contracts

Within the governance section of the application is where you can find all the propsals the community has sumbited when it comes to changing/imporve the application. 

[example Proposal](https://compound.finance/governance/proposals/43)

### **Proposal Lifecycle**

1) **Created** - Proposal is created and submited. Can take some time before it is active
2) **Active** - propasl is active and can now be voted on.
3) **Succeeded** - proposal meet the threshhold to succeed
4) **Queued** - before a proposal actually becaomes active theres a minamal delay until proposal can be excuted
5) **Executed** - somoone executes the `execute` function within the dao. This will only happen if it has suceeded if not it will not execute


## Dao Voting Mechanism
-----

So how do you engage in a DAO?? You might find that his a bit of a tricky problem to solve. 

**Use an er20 token or nft token as voting power**
- this may run a risk of being less fair because when u tokenize the voting power you are essentially giving marjority voting power to someone with the deepest pockets
- another risk is that anyone using there voting power maliciously doesnt get penalized, they could also sell all there voting power and move on. The group as a whole gets penalized
- Real world example: Stocks, more stocks you own more voting power you can have in that company

**Skin in the Game voting method**
- every time you vote ur name/account is connected to it. So if you make a bad/evil decision your voting rights is taken away.
    - the problem with this is how do we decide what is bad or evil



**Proof of Personhood or Participation**
- this would allow all users to have a single vote if they use the protocol even if they have 1000 wallets that use the protocol
    - the issue here is  **sybil resistance** how can we be sure that one vote is one participate
    - **NOTE** this has not been solved yet
- Real world example: Our current voting for goverment officals


## Impelentation of the voting
------ 
**On chain voting**
- smart contract on chain that has voting mechnanics that allows user to vote
    - downside is user has to pay to vote (GAS)

**Off chain voting**
- essentially sign a vote  (transactions) to a decentralized database like IPFS and then when it comes time deliver the result of that data.
    - popular way to do is snapshot
    - saves a tone of gas
    - althought its harder to create


## Dao No Code Solutions
------- 
- daoStack
- aragon
- colony 
- tao house

## Dao code Soultions
----
- snapshot
    - one of the most popular tools out there for both getting the sentiment of a Dao. and actually performing that execution, users can vote through this protocol with their actual tokens, those transcations get stored in IPFS. But none of it actually gets exectued. Unless the DAO chooses to.
- Zodiac 
    - suite of database tools for you to implement into your daos 
- Tally
    - is another one of these UIS that allows user to vote in daos
- Gnosis Safe Multisig wallet
    - a multi sig wallet 
- **OPEN ZEPELLIN CONTRACT**
    - prewritten audited contracts to help build DAO

# DAO Code Example
this example will be using er20 tokens to vote

1) create a basic contract in this example it just stores values (BOX.sol)
2) we need a governace erc20 token to vote

normally we could get away with just creating and erc20 token like so

```
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GovernanceToken is ERC20 {

    uint256 public s_maxSupply = 1000000000000000000000000;

    constructor() ERC20("GovernanceToken", "GT"){
        _mint(msg.sender, s_maxSupply);
    }
```

but someone who know a hot proposal is coming up could buy a ton of tokens, and then dump tokens after.

How do we prevent this??
- we create a snapshot of tokens people have at certain block
- we wanna make sure that once a proposal goes thru we pick a snapshot from the past that we want to use. 
    - incentivies people to not just jump in when its a proposal and jump out because once a proposal hits, it uses a block snapshot from the past. 
- to do this we have to change the erc20 to en erc20Votes token

```
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {
  uint256 public s_maxSupply = 1000000000000000000000000;

  constructor() ERC20("GovernanceToken", "GT") ERC20Permit("GovernanceToken") {
    _mint(msg.sender, s_maxSupply);
  }
}
```

3) Now we need to create the governance_standard
- GovernorContract:
    -  has all the voting logic for our token to use
- timelock:
    - is essentially the owner of the box contract
    - this is important cz whenever we propose something we want to wait for a new vote to be "exectuted"
    - why might we do this, lets say a proposal goes thru that says all people holding the governenace token has to pay 5 tokens 
        - so having this "cool down time" before contract can excute proposal gives users time to "get out" if they dont like a governance update

Another great tool we can use to build this governorContract is openzepplins [wizard](https://wizard.openzeppelin.com/#governor)

4) Now we have to properly assign roles to the timeLock to propose, admin and execute
- updated the timelock to have proposerRole be the governor contract itself
- update the executorRole to allow anyone to execute
    - this is done by changing role to the zero address
- now revoke the admin role from the deployer so to propsole stuff you have to go thru the governor contract

```
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
```

5) Finally lets deploy the box contract and give ownership to the timelock contract so it can only be update thru a governance process


## 