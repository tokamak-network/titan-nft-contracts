const { ethers } = require("hardhat");
var path = require("path");
const fs = require("fs");

const nftJson = require("../artifacts/contracts/TitanNFT.sol/TitanNFT.json")


// for titangoerli
const ownerAddress = '0xc1eba383D94c6021160042491A5dfaF1d82694E6'
const nftAddress = '0xa00Efd0856c449C4B02467A941E1Ec531618d9eB'
const eventAddress = '0x63c95fbA722613Cb4385687E609840Ed10262434'

// for titan
// const ownerAddress = ''
// const nftAddress = ''
// const eventAddress = ''


function getBytesOfGrade(grade) {
  if(grade == 'Titan') return '0x01'
  else if(grade == 'Unique') return '0x02'
  else if(grade == 'Rare') return '0x03'
  else if(grade == 'Normal') return '0x04'
  else return '0x00'
}

function readData(data) {
  var rows = data.split("\n");
  let i = 0;
  let tokenIds = [];
  let attributes = [];

  let ret = {tokenIds: null, attributes: null}
  for (i = 50; i < 100; i++) {
      var row = rows[i].split(",");
      if(row.length > 7) {
        tokenIds.push(ethers.BigNumber.from(row[0].trim()))
        attributes.push(getBytesOfGrade(row[2].trim()))
      }
      else  console.log(i,' line error')
  }

  ret.tokenIds = tokenIds
  ret.attributes = attributes
  return ret;
}

const getCsvData = (filename) => {
    const csvPath = path.join(__dirname,  '../'+filename ) // 두번째 인
    console.log(csvPath)
    const csv = fs.readFileSync(csvPath, "utf-8")
    return csv;
}

async function main() {
  const [deployer ] = await ethers.getSigners();

  const nftContract = (await ethers.getContractAt(nftJson.abi, nftAddress, deployer))

  let data = getCsvData("inputFile/TitanNFT2.csv")
  let metaData = readData(data)
  console.log(metaData.tokenIds)
  console.log(metaData.attributes)

  let tx = await nftContract.connect(deployer).multiMint(
    metaData.tokenIds,
    metaData.attributes,
    eventAddress
  )
  console.log(tx)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
