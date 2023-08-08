
import { expect } from './shared/expect'
import { ethers, network } from 'hardhat'

import { Signer } from 'ethers'
import { titanNftFixture } from './shared/fixtures'
import { TitanNftFixture, NftTokenInfo } from './shared/fixtureInterfaces'


describe('L2ERC721Bridge', () => {
    let deployer: Signer, addr1: Signer, addr2:Signer;
    let deployed: TitanNftFixture
    let nftTokenInfo: NftTokenInfo
    before('create fixture loader', async () => {
        deployed = await titanNftFixture()
        deployer = deployed.deployer;
        addr1 = deployed.addr1;
        addr2 = deployed.addr2;
        nftTokenInfo = {
            name: "Titan NFTs",
            symbol: "TITAN",
            baseURI: "http://titan-nft.tokamak.network/titangoerli-metadata/",
            localToken:  ethers.constants.AddressZero,
            remoteToken: ethers.constants.AddressZero
        }
    })

    describe('# L2ERC721BridgeProxy ', () => {

        it('upgradeToAndCall onlyAdmin', async () => {

            let callData = deployed.l1ERC721Bridge.interface.encodeFunctionData(
                "initialize",[
                    deployed.l2MessengerAddress,
                    deployed.l1ERC721BridgeProxy.address
                ])

            await (await deployed.l2ERC721BridgeProxy.connect(deployer).upgradeToAndCall(
                deployed.l2ERC721Bridge.address,
                callData
                )).wait()

            expect(await deployed.l2ERC721BridgeProxy.MESSENGER()).to.be.eq(deployed.l2MessengerAddress)
            expect(await deployed.l2ERC721BridgeProxy.OTHER_BRIDGE()).to.be.eq(deployed.l1ERC721BridgeProxy.address)

            // console.log('OTHER_BRIDGE', await deployed.l2ERC721Bridge2.OTHER_BRIDGE())

        });
    });

    describe('# L1ERC721BridgeProxy ', () => {

        it('upgradeToAndCall onlyAdmin', async () => {

            let callData = deployed.l1ERC721Bridge.interface.encodeFunctionData(
                "initialize",[
                    deployed.l1MessengerAddress,
                    deployed.l2ERC721BridgeProxy.address
                ])

            await (await deployed.l1ERC721BridgeProxy.connect(deployer).upgradeToAndCall(
                deployed.l1ERC721Bridge.address,
                callData
                )).wait()

            expect(await deployed.l1ERC721BridgeProxy.MESSENGER()).to.be.eq(deployed.l1MessengerAddress)
            expect(await deployed.l1ERC721BridgeProxy.OTHER_BRIDGE()).to.be.eq(deployed.l2ERC721BridgeProxy.address)
        });

    });

    // Create NFT L2 and L1
    describe('# TitanNFT in L2 ', () => {

        // it('upgradeTo() only Owner', async () => {
        //     await (await deployed.titanNFTProxy.connect(deployer).upgradeTo(deployed.titanNFT.address)).wait()
        // });

        it('setBaseURI(string memory baseURI_) only Manager', async () => {
            await deployed.titanNFT2.connect(deployed.manager).setBaseURI(nftTokenInfo.baseURI);
        });

        it('mint(id, details, to) only Manager', async () => {
            let id = ethers.constants.One;
            let details = 1;

            await deployed.titanNFT2.connect(deployed.manager).mint(
                id,
                details,
                addr1.address
            )

            expect(await deployed.titanNFT2.ownerOf(id)).to.be.eq(addr1.address)
            expect(await deployed.titanNFT2.balanceOf(addr1.address)).to.be.eq(ethers.constants.One)
            expect(await deployed.titanNFT2.totalSupply()).to.be.eq(ethers.constants.One)

        });

        it('multiMint(id, details, to) only Manager', async () => {
            let id = ethers.constants.One;

            await deployed.titanNFT2.connect(deployed.manager).multiMint(
                [ethers.constants.Two, ethers.BigNumber.from("3")],
                [1,2],
                addr1.address
            )

            expect(await deployed.titanNFT2.ownerOf(ethers.constants.Two)).to.be.eq(addr1.address)
            expect(await deployed.titanNFT2.balanceOf(addr1.address)).to.be.eq(
                ethers.BigNumber.from("3") )
            expect(await deployed.titanNFT2.totalSupply()).to.be.eq(ethers.BigNumber.from("3"))

        });
    });

    describe('# OptimismMintableERC721Factory in L1 ', () => {

        it('createOptimismMintableERC721', async () => {

            const interface1 = deployed.optimismMintableERC721Factory.interface ;
            const topic = interface1.getEventTopic('OptimismMintableERC721Created');

            const receipt = await (await deployed.optimismMintableERC721Factory.connect(deployer).createOptimismMintableERC721(
                 deployed.titanNFTProxy.address,
                 nftTokenInfo.name,
                 nftTokenInfo.symbol
            )).wait()

            const log = receipt.logs.find(x => x.topics.indexOf(topic) >= 0 );
            const deployedEvent = interface1.parseLog(log);

            expect(deployedEvent.args.remoteToken).to.be.eq(deployed.titanNFTProxy.address)
            expect(deployedEvent.args.deployer).to.be.eq(deployer.address)

            nftTokenInfo.localToken = deployedEvent.args.localToken;
            expect(nftTokenInfo.localToken).to.be.not.eq(ethers.constants.AddressZero)
            nftTokenInfo.remoteToken = deployed.titanNFTProxy.address;
            console.log(nftTokenInfo)
        })
    });


    // start L2
    describe('# L2ERC721Bridge ', () => {

        it('bridgeERC721 only OwnerOf(tokenId)', async () => {
            let id = ethers.constants.One;
            expect(await deployed.titanNFT2.ownerOf(id)).to.be.not.eq(deployer.address)
            await expect (deployed.l2ERC721Bridge2.connect(deployer).bridgeERC721(
                deployed.titanNFTProxy.address,
                nftTokenInfo.localToken,
                id,
                200000,
                '0x00',
            )).to.be.rejectedWith("TitanNFT: transfer caller is not owner nor approved");

        })

        it('bridgeERC721 only OwnerOf(tokenId) : need to approval', async () => {
            let id = ethers.constants.One;
            expect(await deployed.titanNFT2.ownerOf(id)).to.be.eq(addr1.address)
            await expect (deployed.l2ERC721Bridge2.connect(addr1).bridgeERC721(
                deployed.titanNFTProxy.address,
                nftTokenInfo.localToken,
                id,
                200000,
                '0x00',
            )).to.be.rejectedWith("TitanNFT: transfer caller is not owner nor approved");
        })

        it('bridgeERC721 only OwnerOf(tokenId) : need to approval', async () => {
            let id = ethers.constants.One;
            expect(await deployed.titanNFT2.ownerOf(id)).to.be.eq(addr1.address)

            await deployed.titanNFT2.connect(addr1).setApprovalForAll(deployed.l2ERC721Bridge2.address, true)

            // console.log('OTHER_BRIDGE', await deployed.l2ERC721Bridge2.OTHER_BRIDGE())

            await (await deployed.l2ERC721Bridge2.connect(addr1).bridgeERC721(
                deployed.titanNFTProxy.address,
                nftTokenInfo.localToken,
                id,
                200000,
                '0x00',
            )).wait()

        })


    });

});

