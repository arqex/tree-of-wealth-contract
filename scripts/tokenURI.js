const { ethers } = require("hardhat");
// goerli:
// const CONTRACT_ADDRESS = '0x37d4B7268fD23248cC1849C8f3324fcDC5d18954';

// mumbai
// const CONTRACT_ADDRESS = '0x15243765e79b27F0Af10b0ee786330CD788B5AB9';


// mumbai 2 (encoding in the tokenURI method)
const CONTRACT_ADDRESS = '0x841df0FEf613d215d48F15687D5E45D533A8A983';

async function main() {
  const [deployer] = await ethers.getSigners();

  const Monsaic = await ethers.getContractFactory("Monsaic");
  const monsaic = new ethers.Contract(CONTRACT_ADDRESS, Monsaic.interface, deployer);

  const uri = await monsaic.tokenURI( 4 );
  
  console.log( 'NFT URI!', uri );
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
