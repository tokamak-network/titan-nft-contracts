import { expect } from './shared/expect'
import { ethers, network } from 'hardhat'

import { Signer } from 'ethers'
import { titanNftFixture } from './shared/fixtures'
import { TitanNftFixture, NftTokenInfo } from './shared/fixtureInterfaces'


describe('TitanNFT', () => {
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

    describe('# TitanNFTProxy ', () => {

        it('upgradeTo() only Owner', async () => {

            await expect(
                deployed.titanNFTProxy.connect(addr1).upgradeTo(ethers.constants.AddressZero))
                .to.be.rejectedWith("not owner");

            await expect(
                deployed.titanNFTProxy.connect(deployed.manager).upgradeTo(ethers.constants.AddressZero))
                .to.be.rejectedWith("not owner");

            await (await deployed.titanNFTProxy.connect(deployer).upgradeTo(deployed.firstEvent.address)).wait()

            await (await deployed.titanNFTProxy.connect(deployer).upgradeTo(deployed.titanNFT.address)).wait()

        });

    });

    describe('# TitanNFT ', () => {

        it('setBaseURI(string memory baseURI_) only Manager', async () => {
            await expect(
                deployed.titanNFT2.connect(deployer).setBaseURI(nftTokenInfo.baseURI))
                .to.be.rejectedWith("not manager");

            await deployed.titanNFT2.connect(deployed.manager).setBaseURI(nftTokenInfo.baseURI);
        });

        it('mint(id, details, to) only Manager', async () => {
            let id = ethers.constants.One;
            let details = 1;
            await expect(
                deployed.titanNFT2.connect(deployer).mint(
                    id,
                    details,
                    addr1.address
                ))
                .to.be.rejectedWith("not manager");

            await deployed.titanNFT2.connect(deployed.manager).mint(
                id,
                details,
                addr1.address
            )

            expect(await deployed.titanNFT2.ownerOf(id)).to.be.eq(addr1.address)
            expect(await deployed.titanNFT2.balanceOf(addr1.address)).to.be.eq(ethers.constants.One)
            expect(await deployed.titanNFT2.totalSupply()).to.be.eq(ethers.constants.One)

            let ids = await await deployed.titanNFT2.tokensOfOwner(addr1.address)

            // let includes = ids.includes(id)
            let includes = false
            for(let i=0; i < 1; i++){
                if(ids[i].toNumber() == id.toNumber()) includes = true
            }
            expect(includes).to.be.eq(true)
        });

        it('multiMint(id, details, to) only Manager', async () => {
            let id = ethers.constants.One;
            let details = 1;
            await expect(
                deployed.titanNFT2.connect(deployer).multiMint(
                    [id],
                    [details],
                    addr1.address
                ))
                .to.be.rejectedWith("not manager");


            await expect(
                deployed.titanNFT2.connect(deployed.manager).multiMint(
                    [ethers.constants.One, ethers.constants.Two],
                    [1,2],
                    addr1.address
                ))
                .to.be.rejectedWith("TitanNFT: token already minted");

            await deployed.titanNFT2.connect(deployed.manager).multiMint(
                [ethers.constants.Two, ethers.BigNumber.from("3")],
                [1,2],
                addr1.address
            )

            expect(await deployed.titanNFT2.ownerOf(ethers.constants.Two)).to.be.eq(addr1.address)
            expect(await deployed.titanNFT2.balanceOf(addr1.address)).to.be.eq(
                ethers.BigNumber.from("3") )
            expect(await deployed.titanNFT2.totalSupply()).to.be.eq(ethers.BigNumber.from("3"))

            let ids = await await deployed.titanNFT2.tokensOfOwner(addr1.address)
            // expect(ids.includes(ethers.constants.Two)).to.be.eq(true)

            let includes = false
            for(let i=0; i < 3; i++){
                if(ids[i].toNumber() == id.toNumber()) {
                    includes = true
                    break;
                }
            }
            expect(includes).to.be.eq(true)


        });

        it('setTokenURI(uint256 tokenId, string memory _tokenURI) only Manager', async () => {
            let id = ethers.constants.One;
            let newUrl = "1.json"
            let url = await deployed.titanNFT2.tokenURI(id) ;
            expect(url).to.be.eq(""+nftTokenInfo.baseURI+id.toString())

            await expect(
                deployed.titanNFT2.connect(deployer)["setTokenURI(uint256,string)"](
                    id,
                    newUrl
                )).to.be.rejectedWith("not manager");
                // expect(await deployed.titanNFT2.ownerOf(id)).to.be.eq(addr1.address)
            await deployed.titanNFT2.connect(deployed.manager)["setTokenURI(uint256,string)"](
                id,
                newUrl
            )

            expect(await deployed.titanNFT2.tokenURI(id)).to.be.eq(
                ""+nftTokenInfo.baseURI+newUrl)

        });
    });

});

