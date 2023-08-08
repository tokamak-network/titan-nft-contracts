
import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import {  Wallet, Signer } from 'ethers'

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

interface TitanNftFixture  {
    l1ERC721BridgeProxy: L1ERC721BridgeProxy,
    l1ERC721Bridge: L1ERC721Bridge,
    l1ERC721Bridge2: L1ERC721Bridge,
    optimismMintableERC721Factory: OptimismMintableERC721Factory,
    l2ERC721BridgeProxy: L2ERC721BridgeProxy,
    l2ERC721Bridge: L2ERC721Bridge,
    l2ERC721Bridge2: L2ERC721Bridge,
    titanNFT: TitanNFT,
    titanNFTProxy: TitanNFTProxy,
    titanNFT2: TitanNFT,
    firstEvent: FirstEvent,
    deployer: Signer,
    addr1: Signer,
    addr2: Signer,
    manager: Signer,
    l1MessengerAddress : string,
    l2MessengerAddress : string
    // addressManager: Lib_AddressManager,
    // l1Messenger: MockL1Messenger,
    // l2Messenger: MockL2Messenger,
}

interface NftTokenInfo {
    name: string,
    symbol: string,
    baseURI: string,
    localToken: string,
    remoteToken: string
}

export { TitanNftFixture, NftTokenInfo }
