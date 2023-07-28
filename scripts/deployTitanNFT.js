const { ethers } = require("hardhat");

const TitanNFTProxyJson = require("../artifacts/contracts/TitanNFTProxy.sol/TitanNFTProxy.json")
const TitanNFTJson = require("../artifacts/contracts/TitanNFT.sol/TitanNFT.json")

const ownerAddress = '0xc1eba383D94c6021160042491A5dfaF1d82694E6'

async function main() {

  const { deployer, tonAddress, recipientAddress} = await hre.getNamedAccounts();
  console.log('deployer', deployer)
  console.log('tonAddress', tonAddress)
  console.log('recipientAddress', recipientAddress)

  const nftTokenInfo = {
    name: "Titan NFTs",
    symbol: "TITAN",
    maxId : hre.ethers.BigNumber.from("100")
  }

  //==== TitanNFT =================================
  const TitanNFT = await ethers.getContractFactory("TitanNFT");
  const titanNFT = await TitanNFT.deploy(
    nftTokenInfo.name, nftTokenInfo.symbol, deployer, nftTokenInfo.maxId
  );

  await titanNFT.deployed();

  console.log('TitanNFT' , titanNFT.address)


  //==== TitanNFTProxy =================================
  const TitanNFTProxy = await ethers.getContractFactory("TitanNFTProxy");
  const titanNFTProxy = await TitanNFTProxy.deploy(
    nftTokenInfo.name, nftTokenInfo.symbol, deployer, nftTokenInfo.maxId
  );

  await titanNFTProxy.deployed();

  console.log('TitanNFTProxy' , titanNFTProxy.address)

  const proxy = await hre.ethers.getContractAt(
      TitanNFTProxyJson.abi,
      titanNFTProxy.address
    )

  let logic = await proxy.implementation();
  console.log('logic', logic)
  if (logic != titanNFT.address) {
      await (await proxy.upgradeTo( titanNFT.address)).wait()
      let resetLogic = await proxy.implementation();
      console.log('resetLogic', resetLogic)
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
