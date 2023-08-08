import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { L2ERC721BridgeProxy } from '../typechain-types/contracts/L2/L2ERC721BridgeProxy'
import { L2ERC721Bridge } from '../typechain-types/contracts/L2/L2ERC721Bridge.sol'
import { TitanNFT } from '../typechain-types/contracts/TitanNFT'
import { TitanNFTProxy } from '../typechain-types/contracts/TitanNFTProxy'
import { FirstEvent } from '../typechain-types/contracts/FirstEvent.sol'

import IL2ERC721BridgeJson from "../artifacts/contracts/L2/L2ERC721Bridge.sol/L2ERC721Bridge.json"

const l2_messenger = '0x4200000000000000000000000000000000000007';
const l1_bridge = '0xc1653aD979A6EF03719c1d9C46FcFf10A52CFE36';

const deployL2: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    console.log('deployL2 hre.network.config.chainId', hre.network.config.chainId)
    console.log('deployL2 hre.network.name', hre.network.name)
    const { deployer, managerAddress, recipientAddress, tonAddress } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    // titan-goerli
    let nftTokenInfo = {
        name: "Titan NFTs",
        symbol: "TITAN",
        baseURI: "http://titan-nft.tokamak.network/titangoerli-metadata/",
        priceToken : tonAddress,
        priceAmount : hre.ethers.utils.parseEther("30")
    }

    // titan
    // const nftTokenInfo = {
    //     name: "Titan NFTs",
    //     symbol: "TITAN",
    //     baseURI: "http://titan-nft.tokamak.network/titan-metadata/"
    // }

    const deploySigner = await hre.ethers.getSigner(deployer);
    const managerSigner = await hre.ethers.getSigner(managerAddress);

    //==== L2ERC721Bridge =================================
    const L2ERC721Bridge_Deployment = await deploy("L2ERC721Bridge", {
        from: deployer,
        args: [],
        log: true
    });

    //==== L2ERC721BridgeProxy =================================
    const L2ERC721BridgeProxy_Deployment = await deploy("L2ERC721BridgeProxy", {
        from: deployer,
        args: [deployer],
        log: true
    });

    const l2ERC721BridgeProxy = (await hre.ethers.getContractAt(
        L2ERC721BridgeProxy_Deployment.abi,
        L2ERC721BridgeProxy_Deployment.address
    )) as L2ERC721BridgeProxy;

    const l2ERC721Bridge = (await hre.ethers.getContractAt(
        L2ERC721Bridge_Deployment.abi,
        L2ERC721BridgeProxy_Deployment.address
    )) as L2ERC721Bridge;

    //==== L2ERC721BridgeProxy upgradeTo   =================================
    let logic = await l2ERC721BridgeProxy.implementation()

    if (logic != L2ERC721BridgeProxy_Deployment.address) {
        await (await l2ERC721BridgeProxy.connect(deploySigner).upgradeTo(L2ERC721Bridge_Deployment.address)).wait()
    }
    logic = await l2ERC721BridgeProxy.implementation()

    console.log('L2ERC721BridgeProxy logic', logic)


    //==== L2ERC721Bridge initialize  =================================
    const l2ERC721Bridge2 = await hre.ethers.getContractAt(
        IL2ERC721BridgeJson.abi, l2ERC721BridgeProxy.address, deploySigner
      )
    let message = await l2ERC721Bridge2.MESSENGER()
    if (message != l2_messenger) {
        await (await l2ERC721Bridge2.connect(deploySigner).initialize(
            l2_messenger,
            l1_bridge
        )).wait()
    }

    //==== TitanNFT =================================
    const TitanNFT_Deployment = await deploy("TitanNFT", {
        from: deployer,
        args: [],
        log: true
    });

    //==== TitanNFTProxy =================================
    const TitanNFTProxy_Deployment = await deploy("TitanNFTProxy", {
        from: deployer,
        args: [
            nftTokenInfo.name,
            nftTokenInfo.symbol,
            deployer,
            managerAddress
        ],
        log: true
    });

    const titanNFTProxy = (await hre.ethers.getContractAt(
        TitanNFTProxy_Deployment.abi,
        TitanNFTProxy_Deployment.address
    )) as TitanNFTProxy;

    const titanNFT = (await hre.ethers.getContractAt(
        TitanNFT_Deployment.abi,
        TitanNFTProxy_Deployment.address
    )) as TitanNFT;

    //==== TitanNFTProxy upgradeTo   =================================
    let logicTitanNFTProxy = await titanNFTProxy.implementation()

    if (logicTitanNFTProxy != TitanNFT_Deployment.address) {
        await (await titanNFTProxy.connect(deploySigner).upgradeTo(TitanNFT_Deployment.address)).wait()
    }
    logicTitanNFTProxy = await titanNFTProxy.implementation()

    console.log('TitanNFTProxy logic', logicTitanNFTProxy)

    //==== TitanNFTProxy setBaseURI   =================================
    let baseURI = await titanNFT.baseURI()
    if (baseURI != nftTokenInfo.baseURI) {
        await (await titanNFT.connect(managerSigner).setBaseURI(nftTokenInfo.baseURI)).wait()
    }

    //==== FirstEvent =================================
    const FirstEvent_Deployment = await deploy("FirstEvent", {
        from: deployer,
        args: [deployer],
        log: true
    });

    const firstEvent = (await hre.ethers.getContractAt(
        FirstEvent_Deployment.abi,
        FirstEvent_Deployment.address
    )) as FirstEvent;

    //==== setAddress =================================
    let nftAddress = await firstEvent.nftAddress()

    if (nftAddress != titanNFTProxy.address) {
        await (await firstEvent.connect(deploySigner).setAddress(
            titanNFTProxy.address,
            recipientAddress
        )).wait()
    }

    //==== setPrice =================================
    let priceToken = await firstEvent.priceToken()
    if (priceToken != tonAddress) {
        await (await firstEvent.connect(deploySigner).setPrice(
            nftTokenInfo.priceToken,
            nftTokenInfo.priceAmount
        )).wait()
    }

    //==== verify =================================
    if (hre.network.name != "hardhat") {
        // await hre.run("etherscan-verify", {
        //     network: hre.network.name
        // });
        await hre.run("verify:verify",{
                address: L2ERC721Bridge_Deployment.address,
                constructorArguments: [],
            }
        );
        await hre.run("verify:verify",{
            address: TitanNFT_Deployment.address,
            constructorArguments: [],
            }
        );
        await hre.run("verify:verify",{
                address: L2ERC721BridgeProxy_Deployment.address,
                constructorArguments: [
                    deployer
                ],
            }
        );
        await hre.run("verify:verify",{
            address: TitanNFTProxy_Deployment.address,
            constructorArguments: [
                nftTokenInfo.name,
                nftTokenInfo.symbol,
                deployer,
                managerAddress
            ],
        });
        await hre.run("verify:verify",{
            address: firstEvent.address,
            constructorArguments: [
                deployer
            ],
        });
    }
};

export default deployL2;
deployL2.tags = [
    'TitanNFT_L2_deploy'
];