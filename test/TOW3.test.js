const {expect} = require('chai');
const { ethers } = require("hardhat");

const priceRaise = 1;

describe("TOW3 contract", () => {
  let instance;
  let deployer, host1, host2, host3, host4;

  before( async () => {
    const TreeOfWealth = await ethers.getContractFactory("TOW3");
    instance = await TreeOfWealth.deploy( getValue(1) );
    [deployer, host1, host2, host3, host4] = await ethers.getSigners();
  });

  describe("constructor", () => {
    it("should create the TOW token", async () => {
      const uri = await instance.tokenURI(0);
      expect( uri ).not.to.equal(null);
      // const json = JSON.parse(uri);
      // expect( json ).not.to.equal(null);
    });

    it("the initial price needs to be .1 ether", async () => {
      expect( await instance.currentPrice() ).to.equal( getValue(.1) );
    });

    it("the TOW should belong to the contract", async () => {
      expect( await instance.ownerOf(0) ).to.equal(instance.address);
    });

    it("the first host token shouldn't be minted yet", async () => {
      await expect( instance.tokenURI(1) ).to.be.revertedWith("invalid token ID");
    });
  });

  describe("non host operations", () => {
    it('should get an error when getting quantity available to withdraw', async () => {
      instance = instance.connect(host1);
      await expect( instance.availableToWithdraw() ).to.be.revertedWith("You've never been a host");
    });

    it('should get an error when trying to withdraw', async () => {
      instance = instance.connect(host1);
      await expect( instance.withdraw() ).to.be.revertedWith("You've never been a host");
    });

    it('should return false for hasBeenHost', async () => {
      instance = instance.connect(host1);
      expect( await instance.hasBeenHost(host1.address) ).to.equal( false );
    });
  });

  describe("host 1", () => {
    it("shouldn't accept less than the price", async () => {
      instance = instance.connect(host1);
      let value = getValue(.5);
      await expect( instance.host({value}) ).to.be.revertedWith("The price is not right");
    });


    it("shouldn't accept more than the price", async () => {
      instance = instance.connect(host1);
      let value = getValue(2);
      await expect( instance.host({value}) ).to.be.revertedWith("The price is not right");
    });

    it("should emit 2 transfer events when hosting successfully", async () => {
      instance = instance.connect(host1);
      let hostResult = instance.host({value: getValue(.1)});

     await expect( hostResult )
        .to.emit( instance, 'Transfer' )
        .withArgs( instance.address, host1.address, 0 )
      ;

      // This second one is the transfer if the HOST nft
      await expect( hostResult )
        .to.emit( instance, 'Transfer' )
        .withArgs( ethers.constants.AddressZero, host1.address, 1 )
      ;
    });

    it("should be the host the TOW", async () => {
      instance = instance.connect(host1);
      expect( await instance.ownerOf(0) ).to.equal(host1.address);
    });

    it("should be the owner of the token 1", async () => {
      instance = instance.connect(host1);
      expect( await instance.ownerOf(1) ).to.equal(host1.address);
    });

    it("should have minted the token 1 ok", async () => {
      const uri = await instance.tokenURI(1);
      expect( uri ).not.to.equal(null);
    });

    it("should has been the host already", async () => {
      instance = instance.connect(host1);
      expect( await instance.hasBeenHost(host1.address) ).to.equal( true );
    });

    it("should have 0 to withdraw", async () => {
      instance = instance.connect(host1);
      expect( await instance.availableToWithdraw() ).to.equal(0);
    });

    it('should get an error when trying to withdraw', async () => {
      instance = instance.connect(host1);
      await expect( instance.withdraw() ).to.be.revertedWith("No funds to withdraw");
    });

    it("after first hosting, price should be 1", async () => {
      const price = await instance.currentPrice();
      expect( await instance.currentPrice() ).to.equal( getValue(1) );
    });

    it("should not allow the current host to host again" , async () => {
      instance = instance.connect(host1);
      let hostResult = instance.host({value: getValue(.1)});
      await expect( hostResult ).to.be.revertedWith("You've already hosted The Tree");
    });
  });

  describe("Token transfers", () => {
    it("tow shouldnt be transfered by the transfer method", async () => {
      instance = instance.connect(host1);
      await expect(
        instance.transferFrom(host1.address, host2.address, 0)
      ).to.be.revertedWith("Can only transfer by using the host method");
    });

    it("tow shouldnt be transfered by the safe transfer method", async () => {
      instance = instance.connect(host1);
      expect(
        // overridable method
        instance["safeTransferFrom(address,address,uint256)"](host1.address, host2.address, 0)
      ).to.be.revertedWith("Can only transfer by using the host method");
    });


    // [token1] host1 -> host2
    it("other tokens can be transfered", async () => {
      instance = instance.connect(host1);
      await expect( instance.transferFrom(host1.address, host2.address, 1))
        .to.emit( instance, 'Transfer' )
        .withArgs( host1.address, host2.address, 1 )
      ;
    });

    it("address cannot transfer tokens that dont own", async () => {
      instance = instance.connect(host1);
      await expect( instance.transferFrom(host1.address, host2.address, 1))
        .to.be.revertedWith("caller is not token owner nor approved");
      ;
    });

    it("shouldnt approve the transfer of the tow", async () => {
      instance = instance.connect(host1);
      await expect(
        instance.approve(host2.address, 0)
      ).to.be.revertedWith("Can't approve transactions for The Tree");
    });

    it("shouldnt approve the transfer of a token not owned", async () => {
      instance = instance.connect(host1);
      await expect(
        instance.approve(host3.address, 1)
      ).to.be.revertedWith("caller is not token owner nor approved for all");
    });

    it("should approve the transfer of a owned token", async () => {
      instance = instance.connect(host2);
      await expect( instance.approve(host3.address, 1) )
        .to.emit( instance, 'Approval' )
        .withArgs( host2.address, host3.address, 1 )
      ;
    });

    it("should allow approve for all tokens", async () => {
      instance = instance.connect(host1);
      expect( await instance.setApprovalForAll(host2.address, true) )
        .to.emit( instance, 'ApprovalForAll' )
        .withArgs( host1.address, host2.address, true )
      ;
    });

    it("shouldnt allow to transfer ToW from an operator", async () => {
      instance = instance.connect(host2);
      await expect(
        // overridable method
        instance["safeTransferFrom(address,address,uint256)"](host1.address, host2.address, 0)
      ).to.be.revertedWith("Can only transfer by using the host method");
    })

    // [token1] host2 -> host1
    it("should allow to transfer non-ToW tokens from an operator", async () => {
      instance = instance.connect(host3);
      // overridable method
      await expect( instance["safeTransferFrom(address,address,uint256)"](host2.address, host1.address, 1) )
        .to.emit( instance, 'Transfer' )
        .withArgs( host2.address, host1.address, 1 )
      ;
    })
  });

  describe("host 2", () => {
    it("should host the tree by paying 1", async () => {
      instance = instance.connect(host2);
      let hostResult = instance.host({value: getValue(1)});

      await expect( hostResult )
        .to.emit( instance, 'Transfer' )
        .withArgs( host1.address, host2.address, 0 )
      ;

      // This second one is the transfer if the HOST nft
      await expect( hostResult )
        .to.emit( instance, 'Transfer' )
        .withArgs( ethers.constants.AddressZero, host2.address, 2 )
      ;
    });

    it("host2 should be the owner now", async () => {
      expect( await instance.ownerOf(0) ).to.equal(host2.address);
      expect( await instance.ownerOf(1) ).to.equal(host1.address);
      expect( await instance.ownerOf(2) ).to.equal(host2.address);
    });

    it("both hosts should be a previous host now", async() => {
      expect( await instance.hasBeenHost(host1.address) ).to.equal( true );
      expect( await instance.hasBeenHost(host2.address) ).to.equal( true );
      expect( await instance.hasBeenHost(host3.address) ).to.equal( false );
    });

    it("host1 should have value to withdraw", async () => {
      instance = instance.connect(host1);
      expect( await instance.availableToWithdraw() ).to.equal(getValue(1));
    });

    it("host2 should NOT have value to withdraw yet", async () => {
      instance = instance.connect(host2);
      expect( await instance.availableToWithdraw() ).to.equal(0);
    });

    // This test depends on the previous one
    it("price should have been increased", async () => {
      expect( await instance.currentPrice() ).to.equal(getValue(2));
    });
  });

  describe("host 3", () => {
    it("should host the tree by paying 2", async () => {
      instance = instance.connect(host3);
      let hostResult = instance.host({value: getValue(2)});

      await expect( hostResult )
        .to.emit( instance, 'Transfer' )
        .withArgs( host2.address, host3.address, 0 )
      ;

      // This second one is the transfer if the HOST nft
      await expect( hostResult )
        .to.emit( instance, 'Transfer' )
        .withArgs( ethers.constants.AddressZero, host3.address, 3 )
      ;
    });

    it("host3 should be the owner now", async () => {
      expect( await instance.ownerOf(0) ).to.equal(host3.address);
      expect( await instance.ownerOf(1) ).to.equal(host1.address);
      expect( await instance.ownerOf(2) ).to.equal(host2.address);
      expect( await instance.ownerOf(3) ).to.equal(host3.address);
    });

    it("all hosts should be a previous host now", async() => {
      expect( await instance.hasBeenHost(host1.address) ).to.equal( true );
      expect( await instance.hasBeenHost(host2.address) ).to.equal( true );
      expect( await instance.hasBeenHost(host3.address) ).to.equal( true );
    });

    it("withdraw quantities should be updated", async () => {
      instance = instance.connect(host1);
      expect( await instance.availableToWithdraw() ).to.equal(getValue(2));
      instance = instance.connect(host2);
      expect( await instance.availableToWithdraw() ).to.equal(getValue(1));
      instance = instance.connect(host3);
      expect( await instance.availableToWithdraw() ).to.equal(getValue(0));
    });

    // This test depends on the previous one
    it("price should have been increased", async () => {
      expect( await instance.currentPrice() ).to.equal(getValue(3));
    });

    it("previews host can't host again", async () => {
      instance = instance.connect(host1);
      let hostResult1 = instance.host({value: getValue(3)});
      await expect( hostResult1 ).to.be.revertedWith("You've already hosted The Tree");

      instance = instance.connect(host2);
      let hostResult2 = instance.host({value: getValue(3)});
      await expect( hostResult2 ).to.be.revertedWith("You've already hosted The Tree");
    });

    it("host2 should be able to withdraw", async () => {
      instance = instance.connect(host2);

      let balanceBefore = toEth(await getBalance( host2 ));

      toEth(balanceBefore);

      const withdrawResult = instance.withdraw();

      await expect( withdrawResult )
        .to.emit( instance, 'Withdraw' )
        .withArgs( host2.address, getValue(1) )
      ;
    });

    it("after withdrawing, host2 should have 0 to withdraw", async () => {
      instance = instance.connect(host2);
      expect( await instance.availableToWithdraw() ).to.equal(getValue(0));
    });

    it("after withdrawing, host2 should have withdrawn 1", async () => {
      instance = instance.connect(host2);
      expect( await instance.getWithdrawnValue() ).to.equal(getValue(1));
    });
  });

  describe('host 4', () => {
    it("should host the tree by paying 3", async () => {
      instance = instance.connect(host4);
      let hostResult = instance.host({value: getValue(3)});

      await expect( hostResult )
        .to.emit( instance, 'Transfer' )
        .withArgs( host3.address, host4.address, 0 )
      ;

      // This second one is the transfer if the HOST nft
      await expect( hostResult )
        .to.emit( instance, 'Transfer' )
        .withArgs( ethers.constants.AddressZero, host4.address, 4 )
      ;
    });

    it("withdraw quantities should be updated", async () => {
      instance = instance.connect(host1);
      expect( await instance.availableToWithdraw() ).to.equal(getValue(3));
      instance = instance.connect(host2);
      expect( await instance.availableToWithdraw() ).to.equal(getValue(1));
      instance = instance.connect(host3);
      expect( await instance.availableToWithdraw() ).to.equal(getValue(1));
    });
  });


  describe('withdraw', () => {
    it('should return 0 before withdrawing', async  () => {
      instance = instance.connect(host1);
      expect( await instance.getWithdrawnValue() ).to.equal(0);
    });
    
    it("host1 should be able to withdraw", async () => {
      instance = instance.connect(host1);

      let balanceBefore = toEth(await getBalance( host1 ));
      let withdrawAmount = toEth(await instance.availableToWithdraw());

      toEth(balanceBefore);

      const withdrawResult = instance.withdraw();

      await expect( withdrawResult )
        .to.emit( instance, 'Withdraw' )
        .withArgs( host1.address, getValue(withdrawAmount) )
      ;

      let balanceAfter = toEth(await getBalance( host1 ));

      // console.log('Already withdrawn', balanceBefore.toString(), withdrawAmount.toString(), balanceAfter.toString() );
      
      expect( balanceBefore + withdrawAmount ).to.equal(balanceAfter);
    });


    it("once withdrawn host1 has no funds to withdraw again", async () => {
      instance = instance.connect(host1);
      await expect( instance.withdraw() ).to.be.revertedWith("No funds to withdraw");
    });

    it('should return the updated withdrawn value', async  () => {
      instance = instance.connect(host1);
      expect( await instance.getWithdrawnValue() ).to.equal(getValue(3));
    });

    it("host2 should be able to withdraw again", async () => {
      instance = instance.connect(host2);

      let balanceBefore = toEth(await getBalance( host2 ));

      toEth(balanceBefore);

      const withdrawResult = instance.withdraw();

      await expect( withdrawResult )
        .to.emit( instance, 'Withdraw' )
        .withArgs( host2.address, getValue(1) )
      ;
    });

    it("after withdrawing, host2 should have 0 to withdraw", async () => {
      instance = instance.connect(host2);
      expect( await instance.availableToWithdraw() ).to.equal(getValue(0));
    });

    it("after withdrawing, host2 should have withdrawn 2", async () => {
      instance = instance.connect(host2);
      expect( await instance.getWithdrawnValue() ).to.equal(getValue(2));
    });
  });
});

function getValue( value ){
  return ethers.utils.parseEther(value.toString(10));
}


async function getBalance( account ){
  return await account.provider.getBalance( account.address );
}

function toEth( bignumber, withDecimals ){
  let eth = parseFloat( ethers.utils.formatEther( bignumber ) );
  if( !withDecimals ){
    eth = Math.round(eth);
  }
  return eth;
}