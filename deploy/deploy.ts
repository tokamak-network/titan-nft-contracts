import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";


// import TitanNFTProxyJson  from "../artifacts/contracts/TitanNFTProxy.sol/TitanNFTProxy.json"
import { TitanNFTProxy } from '../typechain-types/contracts/TitanNFTProxy'
import { FirstEvent } from '../typechain-types/contracts/FirstEvent.sol/FirstEvent'

const deployTitanNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    console.log('deployL2 hre.network.config.chainId', hre.network.config.chainId)
    console.log('deployL2 hre.network.name', hre.network.name)

    const { deployer, tonAddress} = await hre.getNamedAccounts();
    console.log('deployer', deployer)
    console.log('tonAddress', tonAddress)

    const { deploy, deterministic } = hre.deployments;

    const nftTokenInfo = {
        name: "TITAN NFT",
        symbol: "TITAN"
    }

    const FirstEventInfo = {
        recipient: deployer,
        priceToken : tonAddress,
        priceAmount : hre.ethers.utils.parseEther("30")
    }
    //==== TitanNFT =================================
    const TitanNFTDeployment = await deploy("TitanNFT", {
        from: deployer,
        args: [nftTokenInfo.name, nftTokenInfo.symbol, deployer],
        log: true,
        deterministicDeployment: true,
    });

    // console.log('TitanNFTDeployment', TitanNFTDeployment.address)

    //==== TitanNFTProxy =================================
    const TitanNFTProxyDeployment = await deploy("TitanNFTProxy", {
        from: deployer,
        args: [nftTokenInfo.name, nftTokenInfo.symbol, deployer],
        log: true,
        deterministicDeployment: true,
    });

    // console.log('TitanNFTProxyDeployment', TitanNFTProxyDeployment.address)
    const proxy = (await hre.ethers.getContractAt(
        TitanNFTProxyDeployment.abi,
        TitanNFTProxyDeployment.address
    )) as TitanNFTProxy;

    let logic = await proxy.implementation();
    console.log('logic', logic)
    if (logic != TitanNFTDeployment.address) {
        await (await proxy.upgradeTo( TitanNFTDeployment.address)).wait()
        let resetLogic = await proxy.implementation();
        console.log('resetLogic', resetLogic)
    }


    //==== FirstEvent =================================
    const FirstEventDeployment = await deploy("FirstEvent", {
        from: deployer,
        args: [deployer],
        log: true,
        deterministicDeployment: true,
    });

    const firstEvent = (await hre.ethers.getContractAt(
        FirstEventDeployment.abi,
        FirstEventDeployment.address
    )) as FirstEvent;

    let nftAddress = await firstEvent.nftAddress();
    let recipient = await firstEvent.recipient();

    if (nftAddress!= proxy.address || recipient != FirstEventInfo.recipient) {
        await (await firstEvent.setAddress(proxy.address, FirstEventInfo.recipient)).wait()
    }

    let priceToken = await firstEvent.priceToken();
    let priceAmount = await firstEvent.priceAmount();
    if (priceToken!= FirstEventInfo.priceToken || priceAmount != FirstEventInfo.priceAmount) {
        await (await firstEvent.setPrice(FirstEventInfo.priceToken, FirstEventInfo.priceAmount)).wait()
    }


    //==== verify =================================

    // if (hre.network.name != "hardhat") {
    //     await hre.run("etherscan-verify", {
    //         network: hre.network.name
    //     });
    // }

};

export default deployTitanNFT;
deployTitanNFT.tags = [
    'TitanNFT'
];