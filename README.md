# AAVE3 algorithmic interactions

the goal of this project is to create a code allowing to interact with the aave protocol
Doing stuff like :

1. Deposit collateral
2. Borrow an asset
3. Repay the borrowed token

## commands use

```
yarn add --dev hardhat

yarn hardhat

yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle chai ethereum-waffle hardhat hardhat-contract-sizer hardhat-deploy hardhat-gas-reporter prettier prettier-plugin-solidity solhint solidity-coverage dotenv

yarn hardhat run scripts/aaveBorrow.js  

npm install @aave/protocol-v2


```
