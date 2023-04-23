# Tree of Wealth Solidity Contract

The Tree of Wealth is an NFT that always grows in price and distributes the earnings among anyone who have ever hold it. [Check this video for a better explanation on how the Tree of Wealth works](https://www.youtube.com/watch?v=Y8G5aGKc84I&ab_channel=AprendiendoWeb3). Here's the [video in Spanish](https://www.youtube.com/watch?v=1tS3PFlCGzc&list=PL6W-DT5AOQ0R2-yV3E9cViqZ5WHV4yDOA).

This behavior is possible thanks the smart contract in this repository. This is an immutable contract, it has no address with special privileges, so it will run like this forever. It's deployed on the Ethereum network at `0x27E1F5CcC4F184A2Ca55B12353c06dA9e1803621`. [Check the contract in Etherscan](https://etherscan.io/address/0x27E1F5CcC4F184A2Ca55B12353c06dA9e1803621#code).

To easily interact with the contract there is a frontend application. [Anyone can host The Tree of Wealth by visiting its website](https://treeofwealth.deno.dev). Read [more about the frontend application](#frontend).


## Installation and development

The contract has been developed using [Hardhat](https://hardhat.org/). 

To install the dependencies run:

```bash
npm install
```

This project expect to have a `.env` file with your keys to deploy the contract that is not provided in this repository.

There is a `/scripts` folder with hardhat tasks to build and deploy different versions of the contract, to testnets and the mainnet.

The contract was finally deployed by using [Remix IDE](https://remix.ethereum.org/), that made easier to validate the source code of the contract in Etherscan.

## Frontend
To host The Tree of Wealth or withdraw the coins once you are a host it's always possible to call the functions directly at the [deployed contract](https://etherscan.io/address/0x27E1F5CcC4F184A2Ca55B12353c06dA9e1803621#code) at `0x27E1F5CcC4F184A2Ca55B12353c06dA9e1803621`.

But to make things easier there is a frontend application that can be used to interact with the contract. It's a decentralized web application that can be served by anyone. [Here's the source code of the Tree of Wealth frontend](https://github.com/arqex/tree-of-wealth-app).

The frontend application is a gate to the contract, it can be built locally or it might be deployed to  many different URLs to ensure that the access to operate with The Tree of Wealth is always available. 

When using an online frontend, you need to be sure that you are interacting with the original Tree of Wealth contract when connecting your wallet. The address of the original contract is `0x27E1F5CcC4F184A2Ca55B12353c06dA9e1803621`.

The frontend application has been uploaded to Arweave's permaweb at [wXJX6_kvjI__tmxSOubGxJyAQpK1CfFlw5j2gepiSBk](https://viewblock.io/arweave/tx/wXJX6_kvjI__tmxSOubGxJyAQpK1CfFlw5j2gepiSBk) to be available forever.

Working mirrors of the frontend application are available at:
* https://treeofwealth.deno.dev/
* https://treeofwealth.arweave.dev/
* https://treeofwealth.ar-io.dev/
* https://treeofwealth.g8way.io/
