const { getNamedAccounts, ethers } = require("hardhat");

const getWeth = async () => {
  const { deployer } = await getNamedAccounts();
  // Then we want to call the deposit function on the weth contract, so we can give eth in exchange to weth
  // Important : we can get the abi of the contract by implementing and compiling only the interface of the contract, that's what we did there
  // Address on the mainnet : 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
  // We can actually do something where we fork the mainnet, and run a local hardhat node that is pretending to be a mainnet node.
  // Using a forked network is sometime a good way to run our test, and a good alternative to just using mocks
  const iWeth = await ethers.getContractAt("IWeth", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", deployer);
  const tx = await iWeth.deposit({ value: ethers.utils.parseEther("0.01") });
  await tx.wait(1);
  const wethBalance = await iWeth.balanceOf(deployer);
  console.log(deployer);
  console.log(wethBalance.toString());
};

module.exports = { getWeth };
// This script is exported so our aaveBorrow script can use it
