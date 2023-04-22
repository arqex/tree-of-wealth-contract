const { TOKEN_ADDRESS, AUCTION_ADDRESS } = require("./addresses");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying with account ', deployer.address);
  const MonsaicController = await ethers.getContractFactory("MonsaicController");

  // Start deployment, returning a promise that resolves to a contract object
  const monsaic = await MonsaicController.deploy(TOKEN_ADDRESS, AUCTION_ADDRESS, deployer.address);
  await monsaic.deployed()
  console.log("Contract deployed to address:", monsaic.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
