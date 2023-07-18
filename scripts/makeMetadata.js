const fs = require("fs");

function createMetadata(folder, tokenId, grade, color, type ) {
  //console.log('save ', network, deployed);
    const jsonData = `{
        "description": "This is an NFT to celebrate the opening of Titan.",
        "external_url": "https://titan.tokamak.network",
        "image": "https://titan-nft.s3.ap-northeast-2.amazonaws.com/titangoerli-images/NFT`+tokenId+`.png",
        "name": "Titan #`+tokenId+`",
        "attributes": [
            {
                "trait_type": "Grade",
                "value": "`+grade+`"
            },
            {
                "trait_type": "Color",
                "value": "`+color+`"
            },
            {
                "trait_type": "Type",
                "value": "`+type+`"
            }
        ]
    }
    `

    const jsonData1 =   JSON.stringify(jsonData, null, 2)
    if (!fs.existsSync(folder+`/${tokenId}`)) {
        fs.writeFileSync(folder+`/${tokenId}`, jsonData, { flag: 'w' }, function (err) {
        if (err) throw err;
        });
    }

    // fs.writeFileSync(`deployed.${network}.json`, JSON.stringify(data, null, 2))
}

function randomGrade(num){
    let grade = ['Titan', 'Unique', 'Rare', 'Normal']
    // let ratio = [3, 10, 17, 70]
    let gradeIndex = [
        [3,50,77],
        [1,2,5,8,20,30,44,55,66,99],
        [21,22,23,31,32,33,41,42,43,51,52,53,61,62,63,71,72]
    ]
    let res = gradeIndex[0].includes(num);
    for(let i = 0 ; i <= 2; i++){
        if(gradeIndex[i].includes(num)) return grade[i];
    }
    return grade[3];
}

function randomColor(num){
    let color = ['Red', 'Yellow', 'Blue', 'Orange', 'Purple', 'Green']

    return color[num % color.length];
}

function randomType(num){
    let type = ['T-shirt', 'Cup']
    return type[num % type.length];

}

async function main() {

    let count = 100
    let folder = "metadata/titangoerli"

    for(let i=1; i <= count; i++){
        // console.log(i, randomGrade(i), randomColor(i), randomType(i))
        createMetadata(folder, i, randomGrade(i), randomColor(i), randomType(i) )
    }
  }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
