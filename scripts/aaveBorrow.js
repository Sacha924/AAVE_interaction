const { getWeth } = require("./getWeth");

async function main() {
  // The protocols treats everything as an ERC20 token (but native blockchain tokens like ethereum are not erc20)
  //On a lot of these protocols, when we go to deposit ETH, or matic, or ..., what actually happens is they send your ETH through like what's called a web gateway, and swaps it for WETH, which is basically Eth but in an ERC20 contract
  await getWeth();
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
