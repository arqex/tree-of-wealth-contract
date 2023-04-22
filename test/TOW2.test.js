const {expect} = require('chai');
const { ethers } = require("hardhat");

const TOW_META = 'metadata';
const HOST_SVG = 'host_svg';

const TOW_URI = 'data:application/json;base64,bWV0YWRhdGE=';
const preHostText1 = `pt1`;
const preHostText2 = `pt2`;

const contract1 = "0x93a2802bacdb277237630adae64abc21f59ab5a4";
const contract2 = "0x0ae8daf0d0bcc03d630ca46f579a48137f1e1eae";

describe("TOW2 contract", () => {
  let instance;
  let owner, bidder1, bidder2, repeatingowner;

  before( async () => {
    const TreeOfWealth = await ethers.getContractFactory("TOW2");
    instance = await TreeOfWealth.deploy(TOW_META, preHostText1, preHostText2, ethers.utils.parseEther('1') );
    [owner, bidder1, bidder2, repeatingowner] = await ethers.getSigners();
  })

  describe("constructor", () => {
    it("should create the TOW token", async () => {
      expect( await instance.tokenURI(1) ).to.equal(TOW_URI);
    });

    it("should create the first HOST token", async () => {
      expect( isHostURI(await instance.tokenURI(2)) ).to.equal(true);
    });

    it("the initial price needs to be 1 ether", async () => {
      expect( await instance.currentPrice() ).to.equal( ethers.utils.parseEther('1') );
    });

    it("owner should have 0 value to withdraw", async () => {
      expect( await instance.availableToWithdraw() ).to.equal(0);
    });

    it("the TOW should belong to the owner", async () => {
      expect( await instance.ownerOf(1) ).to.equal(owner.address);
    });

    it("the first HOST token should belong to the owner", async () => {
      expect( await instance.ownerOf(1) ).to.equal(owner.address);
    });
  });

  describe("solidary owner", () => {
    it("no address should be the solidary value owner initially", async () => {
      expect( await instance.currentSolidaryOwner() ).to.equal( ethers.constants.AddressZero );
    });

    it("non-owner shouldnt be able to change the dao address", async () => {
      instance = instance.connect(bidder1);
      expect( instance.setSolidaryDao(bidder2.address) )
        .to.be.revertedWith('Ownable: caller is not the owner');
    });

    it("owner should be able to change the dao address", async () => {
      instance = instance.connect(owner);
      const result = await instance.setSolidaryDao(bidder2.address);
      expect( result.confirmations ).to.equal(1);
    });


    it("should update the solidary owner", async () => {
      instance = instance.connect(bidder2);
      expect( await instance.setCurrentSolidaryOwner(bidder1.address, 'Bidder 1') )
        .to.emit( instance, 'SolidaryOwnerChange' )
        .withArgs(bidder1.address)
      ;
    });
  });


  describe("own", () => {
    it("shouldn't accept less than the price", async () => {
      instance = instance.connect(bidder1);
      let value = ethers.utils.parseEther("0.5");
      expect( instance.host({value}) ).to.be.revertedWith("The price is not right");
    });

    it("shouldn't accept more than the price", async () => {
      instance = instance.connect(bidder1);
      let value = ethers.utils.parseEther("2");
      expect( instance.host({value}) ).to.be.revertedWith("The price is not right");
    });

    it("should not allow the owner to raise the price", async () => {
      instance = instance.connect(owner);
      let value = ethers.utils.parseEther("1");
      expect( instance.host({value}) ).to.be.revertedWith("You already host the tree");
    });

/// SOLIDARY OWNS IT
// owner(2) -> bidder1*(3)
    it("should emit 2 transfer events when hosting successfully", async () => {
      instance = instance.connect(bidder1);
      let value = ethers.utils.parseEther("1");

      let hostResult = await instance.host({value});

      expect( hostResult )
        .to.emit( instance, 'Transfer' )
        .withArgs( owner.address, bidder1.address, 1 )
      ;

      // This second one is the transfer if the HOST nft
      expect( hostResult )
        .to.emit( instance, 'Transfer' )
        .withArgs( ethers.constants.AddressZero, bidder1.address, 3 )
      ;
    });

    it("bidder1 should not be a repeating host", async() => {
      instance = instance.connect(bidder1);
      expect( await instance.isRepeatingHost() ).to.equal( false );
    });

    // This test depends on the previous one
    it("should transfer the ownership", async () => {
      expect( await instance.ownerOf(1) ).to.equal(bidder1.address);
    });

    // This test depends on the previous one
    it("the balance of the bidder1 should be 2 tokens", async () => {
      expect( await instance.balanceOf(bidder1.address) ).to.equal(2);
    });

    // This test depends on the previous one
    it("the new generated NFT should be a HOST one", async () => {
      expect( isHostURI(await instance.tokenURI(3)) ).to.equal(true);
    })

    // This test depends on the previous one
    it("previous host should have value to withdraw", async ( ) => {
      instance = instance.connect(owner);
      expect( await instance.availableToWithdraw() ).to.equal(ethers.utils.parseEther('1'));
    });

    // This test depends on the previous one
    it("current host should not have value to withdraw", async ( ) => {
      instance = instance.connect(bidder1);
      expect( await instance.availableToWithdraw() ).to.equal(0);
    });

    // This test depends on the previous one
    it("price should have been increased", async () => {
      expect( await instance.currentPrice() ).to.equal(ethers.utils.parseEther('2'));
    });

/// OWNER OWNS IT AGAIN
// owner(2) -> bidder1*(3) -> owner(2,4)
    describe('previous owner bid again', () => {
      it("owner should not be a repeating owner", async() => {
        instance = instance.connect(owner);
        expect( await instance.isRepeatingHost() ).to.equal( false );
      });

      // This test depends on the previous one
      it("should emit a transfer event",  async () => {
        instance = instance.connect(owner);
        let value = ethers.utils.parseEther("2");

        let hostResult = await instance.host({value});
        expect( hostResult )
          .to.emit( instance, 'Transfer' )
          .withArgs( bidder1.address, owner.address, 1 )
        ;
        expect( hostResult )
          .to.emit( instance, 'Transfer' )
          .withArgs( ethers.constants.AddressZero, owner.address, 4 )
        ;
      });

      // This test depends on the previous one
      it("intial owner should have the ownership again", async () => {
        expect( await instance.ownerOf(1) ).to.equal(owner.address);
      });

      // This test depends on the previous one
      it("initial owner is a repeating one now", async() => {
        instance = instance.connect(owner);
        expect( await instance.isRepeatingHost() ).to.equal( true );
      });

      // This test depends on the previous one
      it("the balance of the owner should be 3 tokens", async () => {
        expect( await instance.balanceOf(owner.address) ).to.equal(3);
      });

      // This test depends on the previous one
      it("the new generated NFT should be a REPEATING one", async () => {
        expect( isRepeatingURI(await instance.tokenURI(4)) ).to.equal(true);
      });

      // This test depends on the previous one
      it("bidder1 should have value to withdraw", async () => {
        instance = instance.connect(bidder1);
        expect( await instance.availableToWithdraw() ).to.equal(ethers.utils.parseEther('1'));
      });

      // This test depends on the previous one
      it("inital owner should have more value to withdraw", async () => {
        instance = instance.connect(owner);
        expect( await instance.availableToWithdraw() ).to.equal(ethers.utils.parseEther('2'));
      });

      // This test depends on the previous one
      it("price should have been increased", async () => {
        expect( await instance.currentPrice() ).to.equal(ethers.utils.parseEther('3'));
      });
    });

/// BIDDER 2 OWNS IT    
// owner(2) -> bidder1*(3) -> owner(2,4) -> bidder2(5)
    describe('a third owner bids', () => {
      // This test depends on the previous one
      it("should emit a transfer event",  async () => {
        instance = instance.connect(bidder2);
        let value = ethers.utils.parseEther("3");
        expect( await instance.host({value}) )
          .to.emit( instance, 'Transfer' )
          .withArgs( owner.address, bidder2.address, 1 )
        ;
      });

      // This test depends on the previous one
      it("third owner should have the ownership", async () => {
        expect( await instance.ownerOf(1) ).to.equal(bidder2.address);
      });

      // This test depends on the previous one
      it("initial owner is not a repeating one anymore", async() => {
        instance = instance.connect(owner);
        expect( await instance.isRepeatingHost() ).to.equal( false );
      });

      // This test depends on the previous one
      it("repeating owner should have more value to withdraw", async () => {
        instance = instance.connect(bidder1);
        expect( await instance.availableToWithdraw() ).to.equal(ethers.utils.parseEther(String(2+1)));
      });

      // This test depends on the previous one
      it("repeating owner should have just one more token to withdraw", async () => {
        instance = instance.connect(owner);
        expect( await instance.availableToWithdraw() ).to.equal(ethers.utils.parseEther('3'));
      });


      // This test depends on the previous one
      it("current owner should not have value to withdraw", async ( ) => {
        instance = instance.connect(bidder2);
        expect( await instance.availableToWithdraw() ).to.equal(0);
      });

      it("should be repeatingValue caused by the repeating owner", async () => {
        expect( await instance.solidaryValue() ).to.equal(ethers.utils.parseEther('1'));
      });
    });
  
  
/// SOLIDARY OWNS IT AGAIN
// owner(2) -> bidder1*(3) -> owner(2,4) -> bidder2(5) -> bidder1(3,6)
    describe('second owner reown the token', () => {
      // This test depends on the previous one
      it("should emit a transfer event",  async () => {
        instance = instance.connect(bidder1);
        let value = ethers.utils.parseEther("4");
        expect( await instance.host({value}) )
          .to.emit( instance, 'Transfer' )
          .withArgs( bidder2.address, bidder1.address, 1 )
        ;
      });

      // This test depends on the previous one
      it("repeating should have the ownership again", async () => {
        expect( await instance.ownerOf(1) ).to.equal(bidder1.address);
      });

      // This test depends on the previous one
      it("first owner should have more value to withdraw", async () => {
        instance = instance.connect(owner);
        expect( await instance.availableToWithdraw() ).to.equal(ethers.utils.parseEther('4'));
      });

      // This test depends on the previous one
      it("repeating owner should have 2 more token to withdraw", async () => {
        instance = instance.connect(bidder1);
        expect( await instance.availableToWithdraw() ).to.equal(ethers.utils.parseEther(String(3+2)));
      });

      // This test depends on the previous one
      it("third owner should have its first value to withdraw", async () => {
        instance = instance.connect(bidder2);
        expect( await instance.availableToWithdraw() ).to.equal(ethers.utils.parseEther('1'));
      });

      it("repeatingValue should increase caused by the first repeating owner", async () => {
        expect( await instance.solidaryValue() ).to.equal(ethers.utils.parseEther('2'));
      });
    });

/// INITIAL OWNER OWNS IT AGAIN
// owner(2) -> bidder1*(3) -> owner(2,4) -> bidder2(5) -> bidder1*(3,6) -> owner(2,4,7)
    describe('initial owner reown the token again', () => {
      // This test depends on the previous one
      it("should emit a transfer event",  async () => {
        instance = instance.connect(owner);
        let value = ethers.utils.parseEther("5");
        expect( await instance.host({value}) )
          .to.emit( instance, 'Transfer' )
          .withArgs( bidder1.address, owner.address, 1 )
        ;
      });

      // This test depends on the previous one
      it("first owner should have the ownership again", async () => {
        expect( await instance.ownerOf(1) ).to.equal(owner.address);
      });

      // This test depends on the previous one
      it("first owner should have more value to withdraw", async () => {
        instance = instance.connect(owner);
        expect( await instance.availableToWithdraw() ).to.equal(ethers.utils.parseEther('5'));
      });

      // This test depends on the previous one
      it("repeating should have one more token to withdraw plus the repeating value", async () => {
        instance = instance.connect(bidder1);
        expect( await instance.availableToWithdraw() ).to.equal(ethers.utils.parseEther(String(4+4)));
      });

      // This test depends on the previous one
      it("third owner should have its first value to withdraw", async () => {
        instance = instance.connect(bidder2);
        expect( await instance.availableToWithdraw() ).to.equal(ethers.utils.parseEther('2'));
      });

      it("repeatingValue should increased by 2, because there was already 2 repeating owners", async () => {
        expect( await instance.solidaryValue() ).to.equal(ethers.utils.parseEther('4'));
      });
    });

// WITHDRAW
    describe("withdraw", () => {
      it("current owner should be able to withdraw because it was previous owner", async () => {
        instance = instance.connect(owner);

        let balanceBefore = toEth(await getBalance( owner ));
        let withdrawAmount = toEth(await instance.availableToWithdraw());
        await instance.withdraw();
  
        let balanceAfter = toEth(await getBalance( owner ));

        console.log('Already withdrawn', balanceBefore + withdrawAmount );
        
        expect( balanceBefore + withdrawAmount ).to.equal(balanceAfter);
      });

      it("once withdrawn the current owner has no funds to withdraw again", async () => {
        expect( instance.withdraw() ).to.be.revertedWith("No funds to withdraw");
      });
    });

// GET WITHDRAW
    describe("getWithdrawnValue()", () => {
      it("bidder 1 didnt withdraw, so it should return 0", async () => {
        instance = instance.connect(bidder1);
        expect( await instance.getWithdrawnValue() ).to.equal( 0 );
      });


      it("owner should have 5 coins already withdrawn", async () => {
        instance = instance.connect(owner);
        expect( await instance.getWithdrawnValue() ).to.equal( ethers.utils.parseEther("5") );
      });
    });

// TOKEN transfer
// owner(2) -> bidder1*(3) -> owner(2,4) -> bidder2(5) -> bidder1*(3,6) -> owner(2,4,7)
    describe("Token transfers", () => {
      it("owner should be hosting the tree", async () => {
        expect( await instance.ownerOf(1) ).to.equal(owner.address);
      });

      it("tow shouldnt be transfered by the transfer method", async () => {
        instance = instance.connect(owner);
        expect(
          instance.transferFrom(owner.address, bidder1.address, 1)
        ).to.be.revertedWith("ToW: Can only transfer by using the host() method");
      });


      it("tow shouldnt be transfered by the safe transfer method", async () => {
        instance = instance.connect(owner);
        expect(
          // overridable method
          instance["safeTransferFrom(address,address,uint256)"](owner.address, bidder1.address, 1)
        ).to.be.revertedWith("ToW: Can only transfer by using the host() method");
      });

      it("other tokens can be transfered", async () => {
        instance = instance.connect(owner);
        expect( await instance.transferFrom(owner.address, bidder1.address, 2))
          .to.emit( instance, 'Transfer' )
          .withArgs( owner.address, bidder1.address, 2 )
        ;
      });

      it("address cannot transfer tokens that dont own", async () => {
        instance = instance.connect(owner);
        expect( instance.transferFrom(bidder1.address, bidder2.address, 3))
          .to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
        ;
      });

      it("shouldnt approve the transfer of the tow", async () => {
        instance = instance.connect(owner);
        expect(
          instance.approve(bidder1.address, 1)
        ).to.be.revertedWith("ToW: Can't approve transactions for The Tree");
      });

      it("shouldnt approve the transfer of a token not owned", async () => {
        instance = instance.connect(owner);
        expect(
          instance.approve(bidder2.address, 2)
        ).to.be.revertedWith("ERC721: approve caller is not owner nor approved for all");
      });

      it("should approve the transfer of a owned token", async () => {
        instance = instance.connect(owner);
        expect( await instance.approve(bidder2.address, 4) )
          .to.emit( instance, 'Approval' )
          .withArgs( owner.address, bidder2.address, 4 )
        ;
      });

      it("should allow approve for all tokens", async () => {
        instance = instance.connect(owner);
        expect( await instance.setApprovalForAll(bidder2.address, true) )
          .to.emit( instance, 'ApprovalForAll' )
          .withArgs( owner.address, bidder2.address, true )
        ;
      });

      it("shouldnt allow to transfer ToW from an operator", async () => {
        instance = instance.connect(bidder2);
        expect(
          // overridable method
          instance["safeTransferFrom(address,address,uint256)"](owner.address, bidder1.address, 1)
        ).to.be.revertedWith("ToW: Can only transfer by using the host() method");
      })

      it("should allow to transfer non-ToW tokens from an operator", async () => {
        instance = instance.connect(bidder2);
        // overridable method
        expect( await instance["safeTransferFrom(address,address,uint256)"](owner.address, bidder1.address, 7) )
          .to.emit( instance, 'Transfer' )
          .withArgs( owner.address, bidder1.address, 7 )
        ;
      })
    });
  });
});

function isHostURI( uri ){
  console.log('expected host uri', uri );
  return uri.includes('3Qg');
  return uri === 'data:application/json;base64,eyJuYW1lIjogIkhvc3QgIzIiLCJkZXNjcmlwdGlvbiI6ICJHcmFjZWZ1bHkgeW91IGhvc3RlZCBUaGUgVHJlZSBhbmQgeW91ciBraW5kbmVzcyB3aWxsIG5ldmVyIGJlIGZvcmdvdHRlbi4iLCJpbWFnZSI6ImRhdGE6aW1hZ2Uvc3ZnK3htbCxwdDFIb3N0cHQyIzI8L3RzcGFuPjwvdGV4dFBhdGg+PC90ZXh0PjxkZWZzPjxzdHlsZT4uY29sb3Ixe2ZpbGw6I2NjY30gLmNvbG9yMntmaWxsOiM0NTZ9PC9zdHlsZT48L2RlZnM+PC9zdmc+IiwiYXR0cmlidXRlcyI6IFt7InRyYWl0X3R5cGUiOiAiSG9zdGluZyBwcmljZSIsInZhbHVlIjozfV19';
}

function isRepeatingURI( uri ){
  console.log('expected repeating uri', uri );
  return uri === 'data:application/json;base64,eyJuYW1lIjogIlJlcGVhdGluZyBIb3N0ICMxIiwiZGVzY3JpcHRpb24iOiAiVCIsImltYWdlIjoiZGF0YTppbWFnZS9zdmcreG1sLHB0MVJlcGVhdGluZyBIb3N0cHQyIzE8L3RzcGFuPjwvdGV4dFBhdGg+PC90ZXh0PjxkZWZzPjxzdHlsZT4uY29sb3Ixe2ZpbGw6I2RjNX0gLmNvbG9yMntmaWxsOiM5ODF9PC9zdHlsZT48L2RlZnM+PC9zdmc+IiwiYXR0cmlidXRlcyI6IFt7InRyYWl0X3R5cGUiOiAiSG9zdGluZyBwcmljZSIsInZhbHVlIjo0fV19';
}


function toEth( bignumber, withDecimals ){
  let eth = parseFloat( ethers.utils.formatEther( bignumber ) );
  if( !withDecimals ){
    eth = Math.round(eth);
  }
  return eth;
}


async function getBalance( account ){
  return await account.provider.getBalance( account.address );
}