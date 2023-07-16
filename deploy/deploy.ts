import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import  hh from "@nomiclabs/hardhat-ethers";

// import TitanNFTProxyJson  from "../artifacts/contracts/TitanNFTProxy.sol/TitanNFTProxy.json"
import { TitanNFTProxy } from '../typechain-types/contracts/TitanNFTProxy'

const deployTitanNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    console.log('deployL2 hre.network.config.chainId', hre.network.config.chainId)
    console.log('deployL2 hre.network.name', hre.network.name)

    const { deployer } = await hre.getNamedAccounts();
    // console.log('deployer', deployer)
    // console.log('hre.ethers.provider', hre.ethers.provider)

    const { deploy, deterministic } = hre.deployments;

    const nftTokenInfo = {
        name: "TITAN NFT",
        symbol: "TITAN"
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