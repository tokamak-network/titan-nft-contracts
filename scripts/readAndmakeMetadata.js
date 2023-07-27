const fs = require("fs");
var path = require("path");

// for titangoerli
var folder = "metadata/titangoerli"
var imageDefault = "http://titan-nft.tokamak.network/titangoerli-images/"
// metadata http://titan-nft.tokamak.network/titangoerli-metadata/

// for titan
// var folder = "metadata/titan"
// var imageDefault = "http://titan-nft.tokamak.network/titan-images/"
// metadata http://titan-nft.tokamak.network/titan-metadata/

function readData(data) {

    var rows = data.split("\n");
    let i = 0;
    for (i = 0; i < 1; i++) {
        var row = rows[i].split(",");
        // console.log(row)

        if(row.length > 7) createMetadata(row[0].trim(), row[1], row[2], row[3], row[4], row[5], row[6] )
        else  console.log(i,' line error')
    }
}

function createMetadata(tokenId, name, grade, cardColor, cardBorder, logo, externalUrl) {

    const jsonData = `{
        "name": "`+name+`",
        "description": "Only 100 Limited edition NFTs to celebrate the opening of Titan L2",
        "image": "`+imageDefault+tokenId+`.png",
        "external_url": "`+externalUrl+`",
        "publisher": "Tokamak Network",
        "attributes": [
            {
                "trait_type": "Grade",
                "value": "`+grade+`"
            },
            {
                "trait_type": "CardColor",
                "value": "`+cardColor+`"
            },
            {
                "trait_type": "CardBorder",
                "value": "`+cardBorder+`"
            },
            {
                "trait_type": "Logo",
                "value": "`+logo+`"
            }
        ]
    }
    `
    if (!fs.existsSync(folder+`/${tokenId}`)) {
        fs.writeFileSync(folder+`/${tokenId}`, jsonData, { flag: 'w' }, function (err) {
        if (err) throw err;
        });
    }
}

const getCsvData = (filename) => {
    const csvPath = path.join(__dirname,  '../'+filename ) // 두번째 인
    console.log(csvPath)
    const csv = fs.readFileSync(csvPath, "utf-8")
    return csv;
}

async function main() {
    let data = getCsvData("inputFile/TitanNFT2.csv")
    readData(data)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
