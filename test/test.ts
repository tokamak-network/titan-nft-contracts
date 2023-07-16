import { ethers } from "hardhat";

import { TitanNFT } from '../typechain-types/contracts/TitanNFT'
import { TitanNFTProxy } from '../typechain-types/contracts/TitanNFTProxy'
import TitanNFTJson from '../artifacts/contracts/TitanNFT.sol/TitanNFT.json'

async function main() {
  const nftTokenInfo = {
    name: "TITAN NFT",
    symbol: "TITAN"
  }

// const logic = '0x5149496eeC927930F45AFE71a150FFA8B55B8e32'
  // const proxy = '0xd76AeBF18FabE5B4cB292a2af70F620022dC8c10'
  const [deployer ] = await ethers.getSigners();

  const TitanNFT_ = await ethers.getContractFactory('TitanNFT');
  const titanNFT = (await TitanNFT_.connect(deployer).deploy()) as TitanNFT
  console.log('titanNFT', titanNFT.address);

  const TitanNFTProxy_ = await ethers.getContractFactory('TitanNFTProxy');
  const titanNFTProxy = (await TitanNFTProxy_.connect(deployer).deploy(
    nftTokenInfo.name, nftTokenInfo.symbol, deployer.address
  ))
  console.log('titanNFTProxy', titanNFTProxy.address);

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
