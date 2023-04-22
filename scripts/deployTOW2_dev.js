const hre = require("hardhat");

const tokenMeta = {
  "name": "The Tree",
  "description": "The Tree will grant wealth to whoever may ever own it.",
  "image": "<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'><path fill='#FFF' d='M0 0h200v200H0z'/><path d='M136.5 158c8 9 31.3 4.7 63.5 6.4V200H0v-33.2c46.8-.2 71.8-3 75-8.3 11.6-21.4 12.2-45.2 1.7-71.5H128c-21.3 29-7.8 52.6 8.6 71Z' fill='#302F2F'/><path d='M65.8 4c11 0 20.4 6.6 24.4 16a26.5 26.5 0 0 1 40 11.7A26.5 26.5 0 0 1 176.9 46 26 26 0 0 1 163 94.4c-3.9 0-7.5-.9-10.9-2.3l-.1.2a26.5 26.5 0 0 1-33.8 7.6 26.5 26.5 0 0 1-44.3-3 26.5 26.5 0 0 1-41.2-15.5A26.2 26.2 0 0 1 12 56a26.3 26.3 0 0 1 27.4-26c.1-14.6 12-26 26.4-26Z' fill='#302F2F'/><path d='M69.4 13.3a23 23 0 0 1 21 13.8 23.5 23.5 0 0 1 34.5 10.4 23.3 23.3 0 0 1 17.6-7.4c12 .2 21.6 9 22.5 20.1 6.5 4 10.7 11 10.6 18.9a22.4 22.4 0 0 1-23.3 21.5c-3.4 0-6.6-.8-9.4-2.1l-.2.2a23.7 23.7 0 0 1-29.4 5.9c-4.2 5.2-11 8.5-18.5 8.4A23.1 23.1 0 0 1 75 91.3c-3.9 2.5-8.5 4-13.5 4a22.8 22.8 0 0 1-22-17.5A22.2 22.2 0 0 1 22 56a22.4 22.4 0 0 1 24-21.4c.4-12 10.7-21.5 23.3-21.3Z' fill='#FFF'/></svg>"
}

const preHostText1 = `<svg width='300' height='300' xmlns='http://www.w3.org/2000/svg'><defs><path d='M23.3 152.7c0-67.5 55-129.5 122.5-129.5s132.5 45 132.5 129.5' id='tc'/><path d='M22.5 148c0 67.5 55 129.5 122.5 129.5s132.5-45 132.5-129.5' id='bc'/></defs><path d='M0 0h300v300H0z' class='color1' /><circle class='color2' cx='150' cy='150' r='127' /><text font-family='Arial' font-size='30' font-weight='bold' fill='#fff'><textPath text-anchor='middle' href='#tc' startOffset='50%'><tspan alignment-baseline='hanging'>`;
const preHostText2 = `</tspan></textPath></text><text font-family='Arial' font-size='30' font-weight='bold' fill='#fff'><textPath text-anchor='middle' href='#bc' startOffset='50%'><tspan>`;

const priceRaise = ethers.utils.parseEther('0.0001');

async function main() {
  process.env.OPTIMIZE = true;
  await hre.run('compile');

  const [deployer] = await ethers.getSigners();

  console.log('Deploying with account ', deployer.address);
  const TreeOfWealth = await ethers.getContractFactory('TOW2');

  // Start deployment, returning a promise that resolves to a contract object
  const tree = await TreeOfWealth.deploy(JSON.stringify(tokenMeta), preHostText1, preHostText2, priceRaise);
  await tree.deployed()
  console.log("Contract deployed to address:", tree.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
