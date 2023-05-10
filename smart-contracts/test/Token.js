const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, network } = require("hardhat");
const { utils } = require("ethers");

describe("Token contract", function () {
  async function deployTokenFixture() {
    const Token = await ethers.getContractFactory("STKN");
    const ICO = await ethers.getContractFactory("StknICO");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const hardhatToken = await Token.deploy();

    const bal = await hardhatToken.balanceOf(owner.address);
    console.log("Token Premint: ", utils.formatEther(bal));

    const hardhatICO = await ICO.deploy(
      hardhatToken.address,
      Math.floor(new Date() / 1000),
      Math.floor(new Date() / 1000) + 3600 * 24
    );

    await hardhatToken.deployed();
    await hardhatICO.deployed();

    await hardhatToken.transfer(hardhatICO.address, bal);

    // Fixtures can return anything you consider useful for your tests
    return { Token, hardhatToken, ICO, hardhatICO, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { hardhatICO, owner } = await loadFixture(deployTokenFixture);
      expect(await hardhatICO.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const { hardhatICO, hardhatToken, owner } = await loadFixture(
        deployTokenFixture
      );
      const icoBalance = await hardhatToken.balanceOf(hardhatICO.address);
      expect(await hardhatToken.totalSupply()).to.equal(icoBalance);
    });
  });

  describe("User/Owner Cases", function () {
    it("User must deposit proper amount", async function () {
      const { hardhatICO, addr1 } = await loadFixture(deployTokenFixture);

      user_deposit_amount = "0.02";

      // Transfer 0.2 ethers from addr1 to contract
      await hardhatICO
        .connect(addr1)
        .deposit({ value: utils.parseEther(user_deposit_amount) });

      const depositAmt = await hardhatICO.depositedAmountOf(addr1.address);
      expect(depositAmt).to.equals(utils.parseEther(user_deposit_amount));
    });

    it("User must deposit in proper time", async function () {
      const { hardhatICO, addr1 } = await loadFixture(deployTokenFixture);
      user_deposit_amount = "0.02";

      // Transfer 0.2 ethers from addr1 to contract
      await hardhatICO
        .connect(addr1)
        .deposit({ value: utils.parseEther(user_deposit_amount) });
      let bal_on_contract = utils.formatEther(
        await ethers.provider.getBalance(hardhatICO.address)
      );

      console.log(bal_on_contract);
      expect(bal_on_contract).to.equals("0.02");

      await network.provider.send("evm_increaseTime", [3600 * 12]);
      await network.provider.send("evm_mine");

      await hardhatICO
        .connect(addr1)
        .deposit({ value: utils.parseEther(user_deposit_amount) });
      bal_on_contract = utils.formatEther(
        await ethers.provider.getBalance(hardhatICO.address)
      );
      console.log(bal_on_contract);
      expect(bal_on_contract).to.equals("0.04");

      await network.provider.send("evm_increaseTime", [3600 * 13]);
      await network.provider.send("evm_mine");

      try {
        await hardhatICO
          .connect(addr1)
          .deposit({ value: utils.parseEther(user_deposit_amount) });
      } catch {
        bal_on_contract = utils.formatEther(
          await ethers.provider.getBalance(hardhatICO.address)
        );
        console.log(bal_on_contract);
        expect(bal_on_contract).to.equals("0.04");
      }
    });

    it("User can claim when ICO was ended sucessfully", async function () {
      const { hardhatICO, hardhatToken, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      // Transfer 0.2 ethers from addr1 to contract
      await hardhatICO
        .connect(addr1)
        .deposit({ value: utils.parseEther("0.02") });
      let bal_on_contract = utils.formatEther(
        await ethers.provider.getBalance(hardhatICO.address)
      );
      console.log(bal_on_contract, await hardhatICO.raisedAmount());
      await network.provider.send("evm_increaseTime", [3600 * 12]);
      await network.provider.send("evm_mine");
      await hardhatICO
        .connect(addr1)
        .deposit({ value: utils.parseEther("0.45") });
      bal_on_contract = utils.formatEther(
        await ethers.provider.getBalance(hardhatICO.address)
      );
      console.log(
        bal_on_contract,
        await hardhatICO.raisedAmount(),
        await hardhatICO.hardCap()
        // utils.formatEther(await hardhatICO.hardCap())
      );
      await network.provider.send("evm_increaseTime", [3600 * 5]);
      await network.provider.send("evm_mine");

      await hardhatICO
        .connect(addr2)
        .deposit({ value: utils.parseEther("0.15") });
      bal_on_contract = utils.formatEther(
        await ethers.provider.getBalance(hardhatICO.address)
      );
      console.log(
        bal_on_contract,
        utils.formatEther(await hardhatICO.raisedAmount())
      );
      console.log("deposit finished");

      await network.provider.send("evm_increaseTime", [3600 * 12]);
      await network.provider.send("evm_mine");

      await hardhatICO.connect(addr1).claim();
      console.log("claim finished");
      // console.log(addr1);
      const bal = await hardhatICO.getDepositedAmountOf(addr1.address);
      // console.log("Addr1 balance: ", bal);
      expect(await hardhatToken.balanceOf(addr1.address)).to.equals(bal);
    });

    it("User can withdraw when ICO was failed", async function () {
      const { hardhatICO, hardhatToken, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      // Transfer 0.2 ethers from addr1 to contract
      await hardhatICO
        .connect(addr1)
        .deposit({ value: utils.parseEther("0.02") });
      let bal_on_contract = utils.formatEther(
        await ethers.provider.getBalance(hardhatICO.address)
      );
      console.log(
        bal_on_contract,
        utils.formatEther(await hardhatICO.raisedAmount())
      );
      await network.provider.send("evm_increaseTime", [3600 * 12]);
      await network.provider.send("evm_mine");
      await hardhatICO
        .connect(addr1)
        .deposit({ value: utils.parseEther("0.045") });
      bal_on_contract = utils.formatEther(
        await ethers.provider.getBalance(hardhatICO.address)
      );
      await network.provider.send("evm_increaseTime", [3600 * 13]);
      await network.provider.send("evm_mine");

      console.log("deposit finished");

      expect(await hardhatICO.connect(addr1).withdraw()).to.be.revertedWith(
        "NOT_WITHDRAWABLE"
      );
    });
  });
});
