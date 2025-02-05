const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Company Contract", function () {
  let TokenUF, token;
  let UnityFlow, unityFlow;
  let Company, company;
//   let Fundraising, company;
  let owner, founder, cofounder, investor, otherUser;

  beforeEach(async function () {
    [owner, founder, cofounder, investor, otherUser] = await ethers.getSigners();

    TokenUF = await ethers.getContractFactory("TokenUF");
    token = await TokenUF.deploy();
    await token.deployed();

    UnityFlow = await ethers.getContractFactory("UnityFlow");
    unityFlow = await UnityFlow.deploy(token.address);
    await unityFlow.deployed();

    // ???
    Company = await ethers.getContractFactory("Company");
    company = await Company.deploy(1, owner.address, unityFlow.address, token.address);
    await company.deployed();
  });

  it("Повинна створювати компанію з правильним власником", async function () {
    expect(await company.founder()).to.equal(owner.address);
  });

  it("Повинна отримувати ETH", async function () {
    await owner.sendTransaction({
      to: company.address,
      value: ethers.utils.parseEther("1"),
    });

    expect(await ethers.provider.getBalance(company.address)).to.equal(ethers.utils.parseEther("1"));
  });

  it("Повинна дозволяти засновнику знімати ETH", async function () {
    await owner.sendTransaction({
      to: company.address,
      value: ethers.utils.parseEther("1"),
    });

    await company.connect(owner).withdrawETH(ethers.utils.parseEther("0.5"));

    expect(await ethers.provider.getBalance(company.address)).to.equal(ethers.utils.parseEther("0.5"));
  });

  it("Повинна дозволяти створювати фандрейзинг", async function () {
    await expect(
      company.connect(owner).createFundraising("Test Campaign", "Description", "Category", 1000, 7, "image.png")
    ).to.emit(company, "FundraiserCreated");
  });

  it("Повинна дозволяти інвестувати в компанію", async function () {
    await token.transfer(investor.address, ethers.utils.parseUnits("1000", 18));

    await token.connect(investor).approve(company.address, ethers.utils.parseUnits("500", 18));
    await company.connect(investor).invest(ethers.utils.parseUnits("500", 18));

    expect(await company.investorBalances(investor.address)).to.equal(ethers.utils.parseUnits("500", 18));
  });

  it("Повинна дозволяти знімати інвестиції", async function () {
    await token.transfer(investor.address, ethers.utils.parseUnits("1000", 18));

    await token.connect(investor).approve(company.address, ethers.utils.parseUnits("500", 18));
    await company.connect(investor).invest(ethers.utils.parseUnits("500", 18));

    await company.connect(investor).withdrawInvestment(ethers.utils.parseUnits("200", 18));

    expect(await company.investorBalances(investor.address)).to.equal(ethers.utils.parseUnits("300", 18));
  });
});
