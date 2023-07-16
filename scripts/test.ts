const { ethers } = require("hardhat");
import TitanNFTJson from "../artifacts/contracts/TitanNFT.sol/TitanNFT.json"
async function main() {
  const nftTokenInfo = {
    name: "TITAN NFT",
    symbol: "TITAN"
  }

  const [deployer ] = await ethers.getSigners();
  console.log('deployer 1 ', deployer.address);
  let logic_factory = await ethers.getContractFactory("TitanNFT")
  const titanNFT = await logic_factory.deploy(
    nftTokenInfo.name, nftTokenInfo.symbol, deployer.address);
  await titanNFT.deployed()

  console.log("titanNFT ", titanNFT.address);

  let proxy_factory = await ethers.getContractFactory("TitanNFTProxy")
  const titanNFTProxy = await proxy_factory.deploy(
    nftTokenInfo.name, nftTokenInfo.symbol, deployer.address
  );
  await titanNFTProxy.deployed()

  console.log("titanNFTProxy ", titanNFTProxy.address);


  await (await titanNFTProxy.upgradeTo(titanNFT.address)).wait();

  let impl = await titanNFTProxy.implementation()
  console.log('impl', impl);

  let contract = await ethers.getContractAt(TitanNFTJson.abi, titanNFTProxy.address, deployer)
  console.log('contract', contract.address);

  let name = await contract.name();
  let symbol = await contract.symbol();
  console.log('name', name);
  console.log('symbol', symbol);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
