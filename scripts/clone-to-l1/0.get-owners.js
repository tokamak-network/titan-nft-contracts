const { ethers } = require("hardhat");
var path = require("path");
const fs = require("fs");

// const nftJson = require("../../artifacts/contracts/TitanNFT.sol/TitanNFT.json")
const abi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
]
// for titangoerli
// const ownerAddress = '0xc1eba383D94c6021160042491A5dfaF1d82694E6'
// const nftAddress = '0xA9108BBcdF8B16DAA3f1c4E8457219a9ED601213'
// const eventAddress = '0x0ED0B62c1F2C1C30c40fFDd32338F57A4d4C9213'

// for titan
// const ownerAddress = ''
const nftAddress = '0x33Ca9E08b04E20eF3Beef4D77b18D8D4323FFf10'
const eventAddress = '0x40A2A6c340D952ee96BFc243CF1BdeF9aa4e24AE'


// function readData(data) {
//   var rows = data.split("\n");
//   let i = 0;
//   let tokenIds = [];
//   let attributes = [];

//   let ret = {tokenIds: null, attributes: null}
//   for (i = 0; i < 50; i++) {
//       var row = rows[i].split(",");
//       if(row.length > 7) {
//         tokenIds.push(ethers.BigNumber.from(row[0].trim()))
//         attributes.push(getAttributeOfGrade(row[2].trim()))
//       }
//       else  console.log(i,' line error')
//   }

//   ret.tokenIds = tokenIds
//   ret.attributes = attributes
//   return ret;
// }

// const getCsvData = (filename) => {
//     const csvPath = path.join(__dirname,  '../'+filename ) // 두번째 인
//     console.log(csvPath)
//     const csv = fs.readFileSync(csvPath, "utf-8")
//     return csv;
// }

async function main() {
  const [deployer ] = await ethers.getSigners();

  // const filePath = './outputFile/owners.csv';
  // exportLogsToExcel(logUsedGas, workSheetColumnName, workSheetName, filePath, gasPrice)

  // const proxy = await hre.ethers.getContractAt(
  //   TitanNFTProxyJson.abi,
  //   titanNFTProxy.address
  // )

  const nftContract = await ethers.getContractAt(abi, nftAddress, deployer)


  let i = 1
  for (i = 1; i <= 100; i++) {
    let owner = await nftContract.ownerOf(ethers.BigNumber.from(""+i))

    if(owner.toLowerCase() == eventAddress.toLowerCase()) {
      console.log(i, owner, "eventAddress")
    } else {

      let code = await ethers.provider.getCode(owner)
      if (code == '0x')  console.log(i, owner )
        else console.log(i, owner , 'contract')
    }

  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
