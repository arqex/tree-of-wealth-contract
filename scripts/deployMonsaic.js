async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying with account ', deployer.address);
  const Monsaic = await ethers.getContractFactory("Monsaic");

  // Start deployment, returning a promise that resolves to a contract object
  const monsaic = await Monsaic.deploy()
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
