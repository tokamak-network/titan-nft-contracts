import hre from 'hardhat'
import { ethers } from 'hardhat'
import {  Wallet, Signer } from 'ethers'

// import Web3EthAbi from 'web3-eth-abi';
import { TitanNftFixture} from './fixtureInterfaces'
import { keccak256 } from 'ethers/lib/utils'

import { L1ERC721BridgeProxy } from '../../typechain-types/contracts/L1/L1ERC721BridgeProxy'
import { L1ERC721Bridge } from '../../typechain-types/contracts/L1/L1ERC721Bridge.sol'
import { OptimismMintableERC721Factory } from '../../typechain-types/contracts/universal/OptimismMintableERC721Factory'

import { L2ERC721BridgeProxy } from '../../typechain-types/contracts/L2/L2ERC721BridgeProxy'
import { L2ERC721Bridge } from '../../typechain-types/contracts/L2/L2ERC721Bridge.sol'
import { TitanNFT } from '../../typechain-types/contracts/TitanNFT'
import { TitanNFTProxy } from '../../typechain-types/contracts/TitanNFTProxy'
import { FirstEvent } from '../../typechain-types/contracts/FirstEvent.sol'

import { Lib_AddressManager } from '../../typechain-types/contracts/test/Lib_AddressManager'
import { MockL1Messenger } from '../../typechain-types/contracts/test/MockL1Messenger'
import { MockL2Messenger } from '../../typechain-types/contracts/test/MockL2Messenger'

import TitanNFTJson from "../../artifacts/contracts/TitanNFT.sol/TitanNFT.json"
import IL1ERC721BridgeJson from "../../artifacts/contracts/L1/L1ERC721Bridge.sol/L1ERC721Bridge.json"
import IL2ERC721BridgeJson from "../../artifacts/contracts/L2/L2ERC721Bridge.sol/L2ERC721Bridge.json"

export const titanNftFixture = async function (): Promise<TitanNftFixture> {
    const { deployer, tonAddress, managerAddress, recipientAddress,
      l1MessengerAddress,
      l2MessengerAddress,

     } = await hre.getNamedAccounts();
    const [ deploySigner, addr1, addr2] = await ethers.getSigners();
    const managerSigner = await ethers.getSigner(managerAddress);

    // titan-goerli
    const remoteChainId = 5050;

    // titan-goerli
    let nftTokenInfo = {
      name: "Titan NFTs",
      symbol: "TITAN",
      baseURI: "http://titan-nft.tokamak.network/titangoerli-metadata/",
      priceToken : tonAddress,
      priceAmount : hre.ethers.utils.parseEther("30")
  }

  // titan
  // const remoteChainId = 55004;

  // titan
  // const nftTokenInfo = {
  //     name: "Titan NFTs",
  //     symbol: "TITAN",
  //     baseURI: "http://titan-nft.tokamak.network/titan-metadata/"
  // }


    //==== L1ERC721Bridge =================================
    const L1ERC721Bridge_ = await ethers.getContractFactory('L1ERC721Bridge');
    const l1ERC721Bridge = (await L1ERC721Bridge_.connect(deploySigner).deploy()) as L1ERC721Bridge
    // console.log('l1ERC721Bridge', l1ERC721Bridge.address)

    //==== L1ERC721BridgeProxy =================================
    const L1ERC721BridgeProxy_ = await ethers.getContractFactory("L1ERC721BridgeProxy");
    const l1ERC721BridgeProxy = (await L1ERC721BridgeProxy_.connect(deploySigner).deploy(
      deployer
    )) as L1ERC721BridgeProxy;

    await (await l1ERC721BridgeProxy.connect(deploySigner).upgradeTo(l1ERC721Bridge.address)).wait()
    // console.log('l1ERC721BridgeProxy', l1ERC721BridgeProxy.address)

    const l1ERC721Bridge2 = await ethers.getContractAt(
      IL1ERC721BridgeJson.abi, l1ERC721BridgeProxy.address, deploySigner
    )

    //==== OptimismMintableERC721Factory =================================
    const OptimismMintableERC721Factory_ = await ethers.getContractFactory("OptimismMintableERC721Factory");
    const optimismMintableERC721Factory = (await OptimismMintableERC721Factory_.connect(deploySigner).deploy(
      l1ERC721BridgeProxy.address,
      remoteChainId
    )) as OptimismMintableERC721Factory;
    // console.log('optimismMintableERC721Factory', optimismMintableERC721Factory.address)

    //==== L2ERC721Bridge =================================
    const L2ERC721Bridge_ = await ethers.getContractFactory('L2ERC721Bridge');
    const l2ERC721Bridge = (await L2ERC721Bridge_.connect(deploySigner).deploy()) as L2ERC721Bridge
    // console.log('l2ERC721Bridge', l2ERC721Bridge.address)

    //==== L2ERC721BridgeProxy =================================
    const L2ERC721BridgeProxy_ = await ethers.getContractFactory('L2ERC721BridgeProxy');
    const l2ERC721BridgeProxy = (await L2ERC721BridgeProxy_.connect(deploySigner).deploy(
      deployer
    )) as L2ERC721BridgeProxy
    // console.log('l2ERC721BridgeProxy', l2ERC721BridgeProxy.address)

    //==== L2ERC721BridgeProxy upgradeTo   =================================
    await (await l2ERC721BridgeProxy.connect(deploySigner).upgradeTo(l2ERC721Bridge.address)).wait()

    const l2ERC721Bridge2 = await ethers.getContractAt(
      IL2ERC721BridgeJson.abi, l2ERC721BridgeProxy.address, deploySigner
    )


    //==== TitanNFT =================================
    const TitanNFT_ = await ethers.getContractFactory('TitanNFT');
    const titanNFT = (await TitanNFT_.connect(deploySigner).deploy()) as TitanNFT
    // console.log('titanNFT', titanNFT.address)

    //==== TitanNFTProxy =================================
    const TitanNFTProxy_ = await ethers.getContractFactory('TitanNFTProxy');
    const titanNFTProxy = (await TitanNFTProxy_.connect(deploySigner).deploy(
      nftTokenInfo.name,
      nftTokenInfo.symbol,
      deployer,
      managerAddress
    )) as TitanNFTProxy

    await (await titanNFTProxy.connect(deploySigner).upgradeTo(titanNFT.address)).wait()
    // console.log('titanNFTProxy', titanNFTProxy.address)

    //==== TitanNFTProxy setBaseURI   =================================
    const titanNFT2 = await ethers.getContractAt(
      TitanNFTJson.abi, titanNFTProxy.address, deploySigner
    )
    await (await titanNFT2.connect(managerSigner).setBaseURI(nftTokenInfo.baseURI)).wait()


    //==== FirstEvent =================================
    const FirstEvent_ = await ethers.getContractFactory('FirstEvent');
    const firstEvent = (await FirstEvent_.connect(deploySigner).deploy(
      deployer
    )) as FirstEvent
    // console.log('firstEvent', firstEvent.address)

    //==== FirstEvent setAddress =================================
    await (await firstEvent.connect(deploySigner).setAddress(
      titanNFTProxy.address,
      recipientAddress
    )).wait()
    // console.log('setAddress done')

    //==== FirstEvent setPrice =================================
    await (await firstEvent.connect(deploySigner).setPrice(
      nftTokenInfo.priceToken,
      nftTokenInfo.priceAmount
    )).wait()
    // console.log('setPrice done')

    //---- addressManager
    // const Lib_AddressManager = await ethers.getContractFactory('Lib_AddressManager')
    // const addressManager = (await Lib_AddressManager.connect(deploySigner).deploy()) as Lib_AddressManager

    // await addressManager.connect(deployer).setAddress("OVM_Sequencer", sequencer1.address);

    //---
    // const MockL1Messenger = await ethers.getContractFactory('MockL1Messenger')
    // const l1Messenger = (await MockL1Messenger.connect(deploySigner).deploy()) as MockL1Messenger
    // const MockL2Messenger = await ethers.getContractFactory('MockL2Messenger')
    // const l2Messenger = (await MockL2Messenger.connect(deploySigner).deploy()) as MockL2Messenger
    // await addressManager.connect(deployer).setAddress("OVM_L1CrossDomainMessenger", l1Messenger.address);

    return  {
      l1ERC721BridgeProxy: l1ERC721BridgeProxy,
      l1ERC721Bridge: l1ERC721Bridge,
      l1ERC721Bridge2: l1ERC721Bridge2,
      optimismMintableERC721Factory: optimismMintableERC721Factory,
      l2ERC721BridgeProxy: l2ERC721BridgeProxy,
      l2ERC721Bridge: l2ERC721Bridge,
      l2ERC721Bridge2: l2ERC721Bridge2,
      titanNFT: titanNFT,
      titanNFTProxy: titanNFTProxy,
      titanNFT2: titanNFT2,
      firstEvent: firstEvent,
      deployer: deploySigner,
      addr1: addr1,
      addr2: addr2,
      manager: managerSigner,
      l1MessengerAddress :l1MessengerAddress,
      l2MessengerAddress :l2MessengerAddress
      // addressManager: addressManager,
      // l1Messenger: l1Messenger,
      // l2Messenger: l2Messenger,
  }
}

