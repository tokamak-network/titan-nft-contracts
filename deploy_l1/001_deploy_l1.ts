import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { L1ERC721BridgeProxy } from '../typechain-types/contracts/L1/L1ERC721BridgeProxy'
import { L1ERC721Bridge } from '../typechain-types/contracts/L1/L1ERC721Bridge.sol'
import { OptimismMintableERC721Factory } from '../typechain-types/contracts/universal/OptimismMintableERC721Factory'

// titan-goerli
const remoteChainId = 5050;

// titan
// const remoteChainId = 55004;

const deployL1: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    console.log('deployL1 hre.network.config.chainId', hre.network.config.chainId)
    console.log('deployL1 hre.network.name', hre.network.name)

    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    const deploySigner = await hre.ethers.getSigner(deployer);

    //==== L1ERC721Bridge =================================
    const L1ERC721Bridge_Deployment = await deploy("L1ERC721Bridge", {
        from: deployer,
        args: [],
        log: true
    });

    //==== L1ERC721BridgeProxy =================================
    const L1ERC721BridgeProxy_Deployment = await deploy("L1ERC721BridgeProxy", {
        from: deployer,
        args: [deployer],
        log: true
    });

    const l1ERC721BridgeProxy = (await hre.ethers.getContractAt(
        L1ERC721BridgeProxy_Deployment.abi,
        L1ERC721BridgeProxy_Deployment.address
    )) as L1ERC721BridgeProxy;

    const l1ERC721Bridge = (await hre.ethers.getContractAt(
        L1ERC721Bridge_Deployment.abi,
        L1ERC721BridgeProxy_Deployment.address
    )) as L1ERC721Bridge;

    //==== upgradeTo   =================================
    let logic = await l1ERC721BridgeProxy.implementation()

    if (logic != L1ERC721BridgeProxy_Deployment.address) {
        await( await l1ERC721BridgeProxy.connect(deploySigner).upgradeTo(L1ERC721Bridge_Deployment.address)).wait()
    }
    logic = await l1ERC721BridgeProxy.implementation()

    console.log('logic', logic)

    //==== OptimismMintableERC721Factory  =================================
    const OptimismMintableERC721Factory_Deployment = await deploy("OptimismMintableERC721Factory", {
        from: deployer,
        args: [ l1ERC721BridgeProxy.address, remoteChainId],
        log: true
    });

    //==== verify =================================
    if (hre.network.name != "hardhat") {
    //     await hre.run("etherscan-verify", {
    //         network: hre.network.name
    //     });
        await hre.run("verify:verify",{
            address: L1ERC721Bridge_Deployment.address,
            constructorArguments: [],
            }
        );
        await hre.run("verify:verify",{
            address: l1ERC721BridgeProxy.address,
            constructorArguments: [deployer],
            }
        );
        await hre.run("verify:verify",{
            address: OptimismMintableERC721Factory_Deployment.address,
            constructorArguments: [l1ERC721BridgeProxy.address, remoteChainId],
            }
        );
    }
};

export default deployL1;
deployL1.tags = [
    'TitanNFT_L1_deploy'
];