const fs = require("fs");

module.exports = function (network, deployed) {
  //console.log('save ', network, deployed);

  if (!fs.existsSync(`TItan_nft_owners.${network}.json`)) {
    fs.writeFileSync(`TItan_nft_owners.${network}.json`, '{}', { flag: 'w' }, function (err) {
      if (err) throw err;
    });
  }

  let data = JSON.parse(fs.readFileSync(`TItan_nft_owners.${network}.json`).toString());
  data[deployed.name] = deployed.tx;

  //console.log('data[deployed.name]', deployed.name, data[deployed.name]);

  fs.writeFileSync(`TItan_nft_owners.${network}.json`, JSON.stringify(data, null, 2))
}
