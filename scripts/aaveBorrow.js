const { getWeth } = require("./getWeth");
const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  // The protocols treats everything as an ERC20 token (but native blockchain tokens like ethereum are not erc20)
  //On a lot of these protocols, when we go to deposit ETH, or matic, or ..., what actually happens is they send your ETH through like what's called a web gateway, and swaps it for WETH, which is basically Eth but in an ERC20 contract
  await getWeth();
  const { deployer } = await getNamedAccounts();
  // We want to interact with the aave protocol, we need the abi and the address
  const lendingPool = await getLendingPool(deployer);
  console.log(lendingPool.address);

  // We want to deposit some weth into the lending pool
  // We need to approve the lending pool to spend our weth
  const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  await approveErc20(wethTokenAddress, lendingPool.address, ethers.utils.parseEther("0.01"), deployer);
  await lendingPool.deposit(wethTokenAddress, ethers.utils.parseEther("0.01"), deployer, 0);

  // We want to borrow some dai
  let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer);
  const daiPrice = await getDaiPrice();
  const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber()); //0.95 to just borrow 95% and not everything
  const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString());
  console.log(`You can borrow ${amountDaiToBorrow.toString()} DAI`);

  const daiTokenAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";

  await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrowWei, deployer);
  await getBorrowUserData(lendingPool, deployer);
  await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, deployer);
  await getBorrowUserData(lendingPool, deployer);
}

async function getLendingPool(account) {
  const lendingPoolAddressesProvider = await ethers.getContractAt("ILendingPoolAddressesProvider", "0xb53c1a33016b2dc2ff3653530bff1848a515c8c5", account);
  const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool();
  const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account);
  return lendingPool;
}

async function repay(amount, daiAddress, lendingPool, account) {
  await approveErc20(daiAddress, lendingPool.address, amount, account);
  const repayTx = await lendingPool.repay(daiAddress, amount, 1, account);
  await repayTx.wait(1);
  console.log("Repaid!");
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrow, account) {
  const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrow, 1, 0, account);
  await borrowTx.wait(1);
  console.log("You've borrowed!");
}

async function getBorrowUserData(lendingPool, account) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } = await lendingPool.getUserAccountData(account);
  console.log(`You have ${totalCollateralETH} worth of ETH deposited.`);
  console.log(`You have ${totalDebtETH} worth of ETH borrowed.`);
  console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`);
  return { availableBorrowsETH, totalDebtETH };
}

async function getDaiPrice() {
  const daiEthPriceFeed = await ethers.getContractAt("AggregatorV3Interface", "0x773616E4d11A78F511299002da57A0a94577F1f4"); // Sending need a signer, but Reading not !
  const price = (await daiEthPriceFeed.latestRoundData())[1];
  console.log(`The DAI/ETH price is ${price.toString()}`);
  return price;
}

async function approveErc20(erc20Address, spenderAddress, amount, signer) {
  const erc20Token = await ethers.getContractAt("IERC20", erc20Address, signer);
  txResponse = await erc20Token.approve(spenderAddress, amount);
  await txResponse.wait(1);
  console.log("Approved!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
