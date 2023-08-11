import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import "@nomicfoundation/hardhat-chai-matchers";

import "hardhat-gas-reporter";
import dotenv from "dotenv" ;
import "hardhat-deploy";

dotenv.config();
const config: HardhatUserConfig = {
  namedAccounts: {
    deployer: 0,
    addr1: 1,
    addr2: 2,
    managerAddress : {
      default: 3,
      titan: '0xc1eba383D94c6021160042491A5dfaF1d82694E6',
      titangoerli2: '0xc1eba383D94c6021160042491A5dfaF1d82694E6',
      goerli: '0xc1eba383D94c6021160042491A5dfaF1d82694E6'
    },
    tonAddress : {
      default: 4,
      titan: '0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2',
      titangoerli2: '0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa',
      goerli: '0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00'
    },
    recipientAddress : {
      default: 5,
      titan: '0x0EAd220181Dd6816933Da2835B03eD8D7c66FD0a',
      titangoerli2: '0x0EAd220181Dd6816933Da2835B03eD8D7c66FD0a',
      goerli: '0x0EAd220181Dd6816933Da2835B03eD8D7c66FD0a'
    },
    l1MessengerAddress: {
      default: 6,
      goerli: '0x2878373BA3Be0Ef2a93Ba5b3F7210D76cb222e63',
      hardhat: '0x2878373BA3Be0Ef2a93Ba5b3F7210D76cb222e63',
    },
    l2MessengerAddress: {
      default: 7,
      titangoerli2: '0x4200000000000000000000000000000000000007',
      hardhat: '0x4200000000000000000000000000000000000007',
    },
    l1BridgeAddress: {
      default: 8,
      goerli: '0x7377F3D0F64d7a54Cf367193eb74a052ff8578FD',
      hardhat: '0x7377F3D0F64d7a54Cf367193eb74a052ff8578FD',
    },
    l2BridgeAddress: {
      default: 9,
      titangoerli2: '0x4200000000000000000000000000000000000010',
      hardhat: '0x4200000000000000000000000000000000000010',
    },
    l1AddressManagerAddress: {
      default: 10,
      goerli: '0xEFa07e4263D511fC3a7476772e2392efFb1BDb92',
      hardhat: '0xEFa07e4263D511fC3a7476772e2392efFb1BDb92',
    },
  },
  networks: {
    // hardhat: {
    //   forking: {
    //     url: `${process.env.ETH_NODE_URI_TITAN_GOERLI}`,
    //     blockNumber: 21500
    //   },
    //   allowUnlimitedContractSize: false,
    //   deploy: ['deploy']
    // },
    hardhat: {
      forking: {
        url: `${process.env.ETH_NODE_URI_TITAN_GOERLI}`,
        blockNumber: 21500
      },
      allowUnlimitedContractSize: false,
      // deploy: ['deploy_l1', 'deploy_l2'],
      companionNetworks: {
        l2: 'hardhat',
      },
    },
    goerli: {
      url: `${process.env.ETH_NODE_URI_GOERLI}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
      deploy: ['deploy_l1'],
    },
    titan: {
      url: `${process.env.ETH_NODE_URI_TITAN}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
      chainId: 55004,
      gasMultiplier: 1.25,
      gasPrice: 1000000,
    },
    titangoerli2: {
      url: `${process.env.ETH_NODE_URI_TITAN_GOERLI}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
      chainId: 5050,
      gasMultiplier: 1.25,
      gasPrice: 250000,
      deploy: ['deploy_l2'],
    }
  },
  deterministicDeployment: (network: string) => {
    // Skip on hardhat's local network.
    if (network === "31337") {
        return undefined;
    } else {
      return {
        factory: "0x4e59b44847b379578588920ca78fbf26c0b4956c",
        deployer: "0x3fab184622dc19b6109349b94811493bf2a45362",
        funding: "10000000000000000",
        signedTx: "0x00",
      }
    }
  },
  etherscan: {
    apiKey: {
      goerli: `${process.env.ETHERSCAN_API_KEY}`,
      titan: "abc",
      titangoerli2: "abc"
    } ,
    customChains: [
      {
        network: "titan",
        chainId: 55004,
        urls: {
          apiURL: "https://explorer.titan.tokamak.network/api",
          browserURL: "https://explorer.titan.tokamak.network"
        }
      },
      {
        network: "titangoerli2",
        chainId: 5050,
        urls: {
          apiURL: "https://goerli.explorer.tokamak.network/api",
          browserURL: "https://goerli.explorer.tokamak.network"
        }
      }
    ]
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 1,
    coinmarketcap: `${process.env.COINMARKETCAP_API_KEY}`
  },
  solidity: {
    version: '0.8.9',
    settings: {
      optimizer: {
        enabled: true,
        runs: 625,
      },
      metadata: {
        // do not include the metadata hash, since this is machine dependent
        // and we want all generated code to be deterministic
        // https://docs.soliditylang.org/en/v0.8.12/metadata.html
        bytecodeHash: 'none',
      },
    },
  },
};

export default config;
