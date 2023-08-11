import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { TitanNFT } from '../typechain-types/contracts/TitanNFT'
import { TitanNFTProxy } from '../typechain-types/contracts/TitanNFTProxy'
import { FirstEvent } from '../typechain-types/contracts/FirstEvent.sol'

const deployL2: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    console.log('deployL2 hre.network.config.chainId', hre.network.config.chainId)
    console.log('deployL2 hre.network.name', hre.network.name)
    const { deployer, managerAddress, recipientAddress, tonAddress } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    // titan-goerli
    let nftTokenInfo = {
        name: "L2 Titan NFTs",
        symbol: "TITAN",
        baseURI: "http://titan-nft.tokamak.network/titangoerli-metadata/",
        priceToken : tonAddress,
        priceAmount : hre.ethers.utils.parseEther("30")
    }

    // titan
    // const nftTokenInfo = {
    //     name: "L2 Titan NFTs",
    //     symbol: "TITAN",
    //     baseURI: "http://titan-nft.tokamak.network/titan-metadata/"
    // }

    const deploySigner = await hre.ethers.getSigner(deployer);
    const managerSigner = await hre.ethers.getSigner(managerAddress);


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
            address: TitanNFT_Deployment.address,
            constructorArguments: [],
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
    'TitanNFT_deploy'
];