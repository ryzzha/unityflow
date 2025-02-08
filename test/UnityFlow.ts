import { TokenUF, UnityFlow, Company } from "../front/typechain";
import { time, ethers, expect, HardhatEthersSigner } from "./setup";

describe("UnityFlow", function () {
  let token: TokenUF;
  let unityFlow: UnityFlow;
  let company: Company;
  let owner: HardhatEthersSigner, founder: HardhatEthersSigner, cofounder: HardhatEthersSigner, investor: HardhatEthersSigner, richUser: HardhatEthersSigner, user: HardhatEthersSigner, poorUser: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, founder, cofounder, investor, richUser, user, poorUser] = await ethers.getSigners();

    const TokenUFFactory = await ethers.getContractFactory("TokenUF");
    token = await TokenUFFactory.deploy(100000);
    await token.waitForDeployment();

    const UnityFlowFactory = await ethers.getContractFactory("UnityFlow");
    unityFlow = await UnityFlowFactory.deploy(token.target);
    await unityFlow.waitForDeployment();

    const tx_create = await unityFlow.connect(owner).registerCompany("UnityFlow");
    await tx_create.wait();

    company = await ethers.getContractAt("Company", await unityFlow.companies(1));

    const amount = ethers.parseUnits("5000", 18);
    const tx_transfer_1 = await token.connect(owner).transfer(founder.address, amount);
    await tx_transfer_1.wait();

    const tx_transfer_2 = await token.connect(owner).transfer(cofounder.address, amount);
    await tx_transfer_2.wait();

    const tx_transfer_3 = await token.connect(owner).transfer(investor.address, amount);
    await tx_transfer_3.wait();

    const tx_transfer_4 = await token.connect(owner).transfer(user.address, amount);
    await tx_transfer_4.wait();

    const amountForRich = ethers.parseUnits("30000", 18);
    const tx_transfer_5 = await token.connect(owner).transfer(richUser.address, amountForRich);
    await tx_transfer_5.wait();
  });

  it("can create company user with enougth tokens UF and correct data", async function () {
    await expect(unityFlow.connect(poorUser).registerCompany("atb")).to.be.revertedWith("Insufficient token balance to create a company");

    const amount = ethers.parseUnits("100", 18);
    const tx_transfer = await token.connect(owner).transfer(founder.address, amount);
    await tx_transfer.wait();

    await expect(tx_transfer).to.changeTokenBalances(token, [owner, founder], [-amount, amount]);

    const tx_create = await unityFlow.connect(founder).registerCompany("atb");
    await tx_create.wait();

    await expect(tx_create).to.emit(unityFlow, "CompanyRegistered").withArgs(2, await unityFlow.companies(2), founder.address);

    const companyAddress = await unityFlow.companies(2);
    expect(companyAddress).to.not.equal(ethers.ZeroAddress);
    expect(await unityFlow.isCompanyActive(companyAddress)).to.be.true;
    expect(await unityFlow.companyCount()).to.equal(2);
    expect(await unityFlow.activeCompanies()).to.equal(2);

    const companyAtb = await ethers.getContractAt("Company", companyAddress);

    expect(await companyAtb.founder()).to.equal(founder.address);
    expect(await companyAtb.name()).to.equal("atb");
  });

  it("can receive ETH and UF token", async function () {
    const amountETH = ethers.parseEther("500");
    const tx_transfer_eth = await company.connect(user).receiveETH({value: amountETH});
    await tx_transfer_eth.wait();

    expect(tx_transfer_eth).to.changeEtherBalances([user, company], [-amountETH, amountETH]);

    const amountUF = ethers.parseUnits("1000", 18);
    const tx_allow_uf = await token.connect(user).approve(company.target, amountUF);
    await tx_allow_uf.wait();
    const tx_transfer_uf = await company.connect(user).receiveUF(amountUF);
    await tx_transfer_uf.wait();

    expect(tx_transfer_uf).to.changeTokenBalances(token, [user, company], [-amountUF, amountUF]);

    expect(await ethers.provider.getBalance(company.target)).to.equal(amountETH);
    expect(await company.totalFundsETH()).to.equal(amountETH);
    expect(await company.totalFundsUF()).to.equal(amountUF);
    expect(await unityFlow.donationsByCurrency("ETH")).to.equal(amountETH);
    expect(await unityFlow.donationsByCurrency("UF")).to.equal(amountUF);
  });

  it("can allow owner to withdraw ETH and UF token", async function () {
    await user.sendTransaction({
      to: company.target,
      value: ethers.parseEther("500"),
    });

    const tx_allow_uf = await token.connect(user).approve(company.target, ethers.parseUnits("1000", 18));
    await tx_allow_uf.wait();
    const tx_transfer_uf = await company.connect(user).receiveUF(ethers.parseUnits("1000", 18));
    await tx_transfer_uf.wait();

    const withdrawAmountETH = ethers.parseEther("300");
    const tx_withdraw_eth = await company.connect(owner).widthdrawETH(owner.address, withdrawAmountETH);
    await tx_withdraw_eth.wait();

    const withdrawAmountUF = ethers.parseUnits("700", 18);
    const tx_withdraw_uf = await company.connect(owner).widthdrawUF(owner.address, withdrawAmountUF);
    await tx_withdraw_uf.wait();

    expect(tx_withdraw_eth).to.changeEtherBalances([company, owner], [-withdrawAmountETH, withdrawAmountETH]);
    expect(tx_withdraw_uf).to.changeTokenBalances(token, [company, owner], [-withdrawAmountUF, withdrawAmountUF]);
  });

  // it("Повинна дозволяти створювати фандрейзинг і збір не створюється з невірним дедлайном або сумою", async function () {
  //   await expect(
  //     company.connect(owner).createFundraising("Test Campaign", "Description", "Category", 1000, 7, "image.png")
  //   ).to.emit(company, "FundraiserCreated");
  // });

  // it("Повинна дозволяти інвестувати в компанію", async function () {
  //   await token.transfer(investor.address, ethers.utils.parseUnits("1000", 18));

  //   await token.connect(investor).approve(company.address, ethers.utils.parseUnits("500", 18));
  //   await company.connect(investor).invest(ethers.utils.parseUnits("500", 18));

  //   expect(await company.investorBalances(investor.address)).to.equal(ethers.utils.parseUnits("500", 18));
  // });

  // it("Повинна дозволяти знімати інвестиції", async function () {
  //   await token.transfer(investor.address, ethers.utils.parseUnits("1000", 18));

  //   await token.connect(investor).approve(company.address, ethers.utils.parseUnits("500", 18));
  //   await company.connect(investor).invest(ethers.utils.parseUnits("500", 18));

  //   await company.connect(investor).withdrawInvestment(ethers.utils.parseUnits("200", 18));

  //   expect(await company.investorBalances(investor.address)).to.equal(ethers.utils.parseUnits("300", 18));
  // });

  // Перевірка, що статистика оновлюється після донатів та інвестицій
});
