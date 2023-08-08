import { expect } from './shared/expect'
import { ethers, network } from 'hardhat'

import { Signer } from 'ethers'
import { titanNftFixture } from './shared/fixtures'
import { TitanNftFixture, NftTokenInfo } from './shared/fixtureInterfaces'

describe('L1ERC721Bridge', () => {
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

    describe('# L1ERC721BridgeProxy ', () => {

        it('upgradeTo onlyAdmin', async () => {

            await expect(
                deployed.l1ERC721BridgeProxy.connect(addr1).upgradeTo(
                    ethers.constants.AddressZero))
                .to.be.rejectedWith("not admin");

            await (await deployed.l1ERC721BridgeProxy.connect(deployer).upgradeTo(
                deployed.firstEvent.address)).wait()
        });

        it('upgradeToAndCall onlyAdmin', async () => {

            let callData = deployed.l1ERC721Bridge.interface.encodeFunctionData(
                "initialize",[
                    deployed.l1MessengerAddress,
                    deployed.l2ERC721BridgeProxy.address
                ])

            await expect(
                deployed.l1ERC721BridgeProxy.connect(addr1).upgradeToAndCall(
                    deployed.l1ERC721Bridge.address,
                    callData
                ))
                .to.be.rejectedWith("not admin");

            await (await deployed.l1ERC721BridgeProxy.connect(deployer).upgradeToAndCall(
                deployed.l1ERC721Bridge.address,
                callData
                )).wait()

            expect(await deployed.l1ERC721BridgeProxy.MESSENGER()).to.be.eq(deployed.l1MessengerAddress)
            expect(await deployed.l1ERC721BridgeProxy.OTHER_BRIDGE()).to.be.eq(deployed.l2ERC721BridgeProxy.address)
        });

        it('changeAdmin onlyAdmin', async () => {
            await expect(
                deployed.l1ERC721BridgeProxy.connect(addr1).changeAdmin(
                    addr1.address
                ))
                .to.be.rejectedWith("not admin");

            await deployed.l1ERC721BridgeProxy.connect(deployer).changeAdmin(addr1.address)
            expect(await deployed.l1ERC721BridgeProxy.admin()).to.be.eq(addr1.address)

            await deployed.l1ERC721BridgeProxy.connect(addr1).changeAdmin(deployer.address)

        });

    });

    describe('# L1ERC721Bridge ', () => {

        it('initialize only Owner', async () => {

            await expect(
                deployed.l1ERC721Bridge2.connect(addr1).initialize(
                    deployed.l1MessengerAddress,
                    deployed.l2ERC721BridgeProxy.address
                ))
                .to.be.rejectedWith("not owner");

            await deployed.l1ERC721Bridge2.connect(deployer).initialize(
                ethers.constants.AddressZero,
                deployed.l2ERC721BridgeProxy.address
            )

            expect(await deployed.l1ERC721BridgeProxy.MESSENGER()).to.be.eq(ethers.constants.AddressZero)
            expect(await deployed.l1ERC721BridgeProxy.OTHER_BRIDGE()).to.be.eq(deployed.l2ERC721BridgeProxy.address)

            await deployed.l1ERC721Bridge2.connect(deployer).initialize(
                deployed.l1MessengerAddress,
                deployed.l2ERC721BridgeProxy.address
            )
            expect(await deployed.l1ERC721BridgeProxy.MESSENGER()).to.be.eq(deployed.l1MessengerAddress)
            expect(await deployed.l1ERC721BridgeProxy.OTHER_BRIDGE()).to.be.eq(deployed.l2ERC721BridgeProxy.address)
        });

        it('setSemver only Owner', async () => {
            await expect(
                deployed.l1ERC721Bridge2.connect(addr1).setSemver(
                    1,1,1
                ))
                .to.be.rejectedWith("not owner");

            await deployed.l1ERC721Bridge2.connect(deployer).setSemver(
                1,2,3
            )
            expect(await deployed.l1ERC721Bridge2.MAJOR_VERSION()).to.be.eq(1)
            expect(await deployed.l1ERC721Bridge2.MINOR_VERSION()).to.be.eq(2)
            expect(await deployed.l1ERC721Bridge2.PATCH_VERSION()).to.be.eq(3)
        });

        // it('bridgeERC721', async () => {

        // });


        // it('bridgeERC721To ', async () => {

        // });

        // it('finalizeBridgeERC721 onlyOtherBridge ', async () => {

        // });
    });

});

