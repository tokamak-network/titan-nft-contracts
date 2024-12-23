const { ethers } = require("hardhat");
var path = require("path");
const fs = require("fs");

const nftJson = require("../artifacts/contracts/TitanNFT.sol/TitanNFT.json")

// for titangoerli
// const ownerAddress = '0xc1eba383D94c6021160042491A5dfaF1d82694E6'
// const nftAddress = '0xA9108BBcdF8B16DAA3f1c4E8457219a9ED601213'
// const eventAddress = '0x0ED0B62c1F2C1C30c40fFDd32338F57A4d4C9213'

// for titan
// const ownerAddress = ''
const nftAddress = '0x33Ca9E08b04E20eF3Beef4D77b18D8D4323FFf10'
const eventAddress = '0x40A2A6c340D952ee96BFc243CF1BdeF9aa4e24AE'


function getAttributeOfGrade(grade) {
  if(grade == 'Titan') return 1
  else if(grade == 'Unique') return 2
  else if(grade == 'Rare') return 3
  else if(grade == 'Normal') return 4
  else return 0
}

function readData(data) {
  var rows = data.split("\n");
  let i = 0;
  let tokenIds = [];
  let attributes = [];

  let ret = {tokenIds: null, attributes: null}
  for (i = 0; i < 50; i++) {
      var row = rows[i].split(",");
      if(row.length > 7) {
        tokenIds.push(ethers.BigNumber.from(row[0].trim()))
        attributes.push(getAttributeOfGrade(row[2].trim()))
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

  let data = getCsvData("inputFile/TitanNFT.csv")
  let metaData = readData(data)
  // console.log(metaData.tokenIds)
  // console.log(metaData.attributes)

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
