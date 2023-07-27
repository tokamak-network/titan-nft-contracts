const { ethers } = require("hardhat");

const ownerAddress = '0xc1eba383D94c6021160042491A5dfaF1d82694E6'

async function main() {

  const FirstEvent = await ethers.getContractFactory("FirstEvent");
  const firstEvent = await FirstEvent.deploy(ownerAddress);

  let tx = await firstEvent.deployed();

  // console.log(tx)

  console.log('firstEvent' , firstEvent.address)

  // deployed firstEvent 0x63c95fbA722613Cb4385687E609840Ed10262434
  // startTime 설정해야 합니다!!
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
