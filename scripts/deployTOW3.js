const hre = require("hardhat");

const priceRaise = ethers.utils.parseEther('0.001');

async function main() {
  process.env.OPTIMIZE = true;
  await hre.run('compile');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account ', deployer.address);
  const TreeOfWealth = await ethers.getContractFactory('TOW3');

  // Estimate gas for the deployment
  const deploymentData = TreeOfWealth.interface.encodeDeploy([priceRaise]);
  const estimatedGas = await ethers.provider.estimateGas({ data: deploymentData });
  const accountBalance = await ethers.provider.getBalance( deployer.address );
  const feeData = await ethers.provider.getFeeData();

  const aproxGasLimit = 4277916;
  let price = parseInt( feeData.gasPrice.toString(), 10 ) * parseInt( aproxGasLimit, 10);

  console.log('Estimated gas', estimatedGas.toString());

  console.log(`${price} - gas price\n${accountBalance.toString()} - balance`);
  console.log('Fee data', Object.keys(feeData).map( key => [key, feeData[key].toString()] ));

  // Start deployment, returning a promise that resolves to a contract object
  
  const tree = await TreeOfWealth.deploy(priceRaise);
  await tree.deployed();
  console.log("Contract deployed to address:", tree.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const transaction = await tree.deployTransaction.wait();
  console.log("Transaction", transaction);
  console.log("Gas used", transaction.gasUsed?.toString());
  // console.log("result", result);
} 

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })