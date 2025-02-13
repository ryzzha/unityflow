import { AddressLike } from "ethers";
import { TokenUF, UnityFlow, Company, ProposalManager__factory } from "../front/typechain";
import { time, ethers, expect, HardhatEthersSigner } from "./setup";

describe("UnityFlow", function () {
  let token: TokenUF;
  let unityFlow: UnityFlow;
  let company: Company;
  let owner: HardhatEthersSigner, founder: HardhatEthersSigner, cofounder: HardhatEthersSigner, investor: HardhatEthersSigner, richUser: HardhatEthersSigner, user: HardhatEthersSigner, poorUser: HardhatEthersSigner;

  const SECONDS_IN_A_DAY = 24 * 60 * 60;

  beforeEach(async function () {
    [owner, founder, cofounder, investor, richUser, user, poorUser] = await ethers.getSigners();

    const TokenUFFactory = await ethers.getContractFactory("TokenUF");
    token = await TokenUFFactory.deploy(100000);
    await token.waitForDeployment();

    const MockPriceFeedFactory = await ethers.getContractFactory("MockPriceFeed");
    const ethInitialPrice = ethers.parseUnits("3000", 8); // 3000$
    const tokenInitialPrice = ethers.parseUnits("5", 8); // 5$
    const ethPriceFeed = await MockPriceFeedFactory.deploy(ethInitialPrice);
    await ethPriceFeed.waitForDeployment();
    const tokenPriceFeed = await MockPriceFeedFactory.deploy(tokenInitialPrice);
    await tokenPriceFeed.waitForDeployment();

    const FundraisingManagerFactory = await ethers.getContractFactory("FundraisingManager");
    const fundraisingManager = await FundraisingManagerFactory.deploy(token.target,  ethPriceFeed.target, tokenPriceFeed.target);
    await fundraisingManager.waitForDeployment();

    const ProposalManagerFactory = await ethers.getContractFactory("ProposalManager");
    const proposalManager = await ProposalManagerFactory.deploy(token.target);
    await proposalManager.waitForDeployment();


    const UnityFlowFactory = await ethers.getContractFactory("UnityFlow");
    unityFlow = await UnityFlowFactory.deploy(
        token.target, 
        fundraisingManager.target, 
        proposalManager.target,
    );
    await unityFlow.waitForDeployment();

    const image = "test-url";
    const description = "Decentralized tech company";
    const cofounders: AddressLike[] = [];
    const tx_create = await unityFlow.connect(owner).registerCompany("UnityFlow", image, description, "Web3", cofounders);
    await tx_create.wait();
    company = await ethers.getContractAt("Company", await unityFlow.getCompanyAddress(1));

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
    const image = "test-url";
    const description = "Decentralized tech company";
    const cofounders: AddressLike[] = [cofounder.address];
    await expect(unityFlow.connect(poorUser).registerCompany("atb", image, description, "Web3", cofounders)).to.be.revertedWith("Insufficient token balance to create a company");

    const amount = ethers.parseUnits("100", 18);
    const tx_transfer = await token.connect(owner).transfer(founder.address, amount);
    await tx_transfer.wait();

    await expect(tx_transfer).to.changeTokenBalances(token, [owner, founder], [-amount, amount]);

    const tx_create = await unityFlow.connect(founder).registerCompany("atb", image, description, "Web3", cofounders);
    await tx_create.wait(); 

    // const filter = unityFlow.filters.CompanyRegistered();
    // const events = await unityFlow.queryFilter(filter);
    // console.log("Events:", events);

    const companyManager = await ethers.getContractAt("CompanyManager", await unityFlow.companyManager());

    // await expect(tx_create).to.emit(companyManager, "CompanyRegistered").withArgs(1, await unityFlow.getCompanyAddress(2), founder.address);

    const companyAddress = await unityFlow.getCompanyAddress(2);
    expect(companyAddress).to.not.equal(ethers.ZeroAddress);
    expect(await unityFlow.isActiveCompany(companyAddress)).to.be.true;
    // expect(await unityFlow.getActiveCompanies()).to.equal(2);

    const companyAtb = await ethers.getContractAt("Company", companyAddress);

    expect(await companyAtb.founder()).to.equal(founder.address);
    expect(await companyAtb.name()).to.equal("atb");
    await expect(companyAtb.connect(user).closeCompany()).to.be.revertedWithCustomError(companyAtb, "OwnableUnauthorizedAccount");
    // await expect(companyAtb.connect(founder).closeCompany()).to.emit(unityFlow, "CompanyClosed").withArgs(2, await unityFlow.getCompanyAddress(2), companyAtb.target);
    // await expect(companyAtb.connect(founder).closeCompany()).to.be.rejectedWith("Company is already closed");
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
    const tx_withdraw_eth = await company.connect(owner).withdrawETH(owner.address, withdrawAmountETH);
    await tx_withdraw_eth.wait();

    const withdrawAmountUF = ethers.parseUnits("700", 18);
    const tx_withdraw_uf = await company.connect(owner).withdrawUF(owner.address, withdrawAmountUF);
    await tx_withdraw_uf.wait();

    expect(tx_withdraw_eth).to.changeEtherBalances([company, owner], [-withdrawAmountETH, withdrawAmountETH]);
    expect(tx_withdraw_uf).to.changeTokenBalances(token, [company, owner], [-withdrawAmountUF, withdrawAmountUF]);
  });

  it("can allow to create fundraising with correct data", async function () {
    const deadline_correct = Math.floor(Date.now() / 1000) + 7 * SECONDS_IN_A_DAY;
    await expect(
      company.connect(owner).createFundraising("test fund", "description:)", "startup", 1000, deadline_correct, "image.png")
    ).to.emit(company, "FundraiserCreated");

    const deadline_wrong = Math.floor(Date.now() / 1000) + 31 * SECONDS_IN_A_DAY;
    await expect(
      company.connect(owner).createFundraising("test fund", "description:)", "startup", 1000, deadline_wrong, "image.png")
    ).to.be.revertedWith("Invalid deadline");

    await expect(
      company.connect(owner).createFundraising("test fund", "description:)", "startup", 1000001, deadline_correct, "image.png")
    ).to.be.revertedWith("Goal out of range");

    const image = "test-url";
    const description = "Decentralized tech company";
    const cofounders: AddressLike[] = [cofounder.address];
    const tx_create = await unityFlow.connect(founder).registerCompany("atb", image, description, "Web3", cofounders);
    await tx_create.wait(); 

    const companyAddress = await unityFlow.getCompanyAddress(2);
    const companyAtb = await ethers.getContractAt("Company", companyAddress);

    // await expect(unityFlow.connect(founder).closeCompany(await companyAtb.id())).to.emit(unityFlow, "CompanyClosed").withArgs(2, await unityFlow.getCompanyAddress(2), founder.address);
  
    const tx_close = await unityFlow.connect(founder).closeCompany(await companyAtb.id())
    await tx_close.wait();

    await expect(
      companyAtb.connect(founder).createFundraising("atb fund", "description:)", "fund", 1000, deadline_correct, "image.png")
    ).to.be.rejectedWith("Only active companies can create fundraisers");
  });

  it("dao voting works correct", async function () {
    const newFee = 7;
    // const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const data_1 = unityFlow.interface.encodeFunctionData("updatePlatformFee", [newFee]);
    const data_2 = unityFlow.interface.encodeFunctionData("updatePlatformFee", [newFee +1]);
    const description = "change fee";
    const deadline = Math.floor(Date.now() / 1000) + 3 * SECONDS_IN_A_DAY;

    // console.log(data);

    const tx_create_proposal_1 = await unityFlow.connect(user).createProposal(unityFlow.target, data_1, description, deadline);
    await tx_create_proposal_1.wait();

    const tx_create_proposal_2 = await unityFlow.connect(owner).createProposal(unityFlow.target, data_2, description, deadline);
    await tx_create_proposal_2.wait();

    await expect(unityFlow.connect(user).createProposal(unityFlow.target, data_1, description, deadline)).to.be.revertedWith("Wait before creating a new proposal")
    await expect(unityFlow.connect(richUser).createProposal(unityFlow.target, data_1, description, deadline)).to.be.revertedWith("Proposal already exists");

    const proposalManager = ProposalManager__factory.connect(await unityFlow.proposalManager(), ethers.provider);
    const filter = proposalManager.filters.ProposalCreated();
    const events = await proposalManager.queryFilter(filter);
    
    const first_proposal_hash = events[0].args[1];
    const second_proposal_hash = events[1].args[1];

    const tx_vote_for_1 = await unityFlow.connect(founder).vote(first_proposal_hash, true);
    await tx_vote_for_1.wait();

    await expect(unityFlow.connect(owner).executeProposal(first_proposal_hash, unityFlow.target, description, data_1)).to.be.revertedWith('Not enough votes');

    const tx_vote_for_second_1 = await unityFlow.connect(richUser).vote(second_proposal_hash, false);
    await tx_vote_for_second_1.wait();

    const tx_vote_for_2 = await unityFlow.connect(richUser).vote(first_proposal_hash, true);
    await tx_vote_for_2.wait();

    const tx_vote_against = await unityFlow.connect(investor).vote(first_proposal_hash, false);
    await tx_vote_against.wait();

    // const first_proposal = await proposalManager.proposals(first_proposal_hash);
    // console.log("first_proposal");
    // console.log(first_proposal);

    expect(tx_create_proposal_1).to.emit(proposalManager, "ProposalCreated").withArgs(1, user.address, unityFlow.target, description, deadline);
    expect(tx_vote_for_2).to.emit(proposalManager, "VoteCast").withArgs(first_proposal_hash, richUser.address, true, await token.balanceOf(richUser.address));
    expect(tx_vote_against).to.emit(proposalManager, "VoteCast").withArgs(first_proposal_hash, investor.address, false, await token.balanceOf(investor.address));

    await expect(unityFlow.connect(owner).executeProposal(first_proposal_hash, unityFlow.target, description, data_1)).to.be.revertedWith('Voting period has not ended');

    await time.increase(SECONDS_IN_A_DAY * 5);

    await expect(unityFlow.connect(owner).executeProposal(second_proposal_hash, unityFlow.target, description, data_2)).to.be.revertedWith('Proposal did not pass');

    expect(await unityFlow.platformFeePercent()).to.be.equal(5);

    const tx_execute_proposal = await unityFlow.connect(owner).executeProposal(first_proposal_hash, unityFlow.target, description, data_1);
    await tx_execute_proposal.wait();

    expect(await unityFlow.platformFeePercent()).to.be.equal(newFee);

    await expect(unityFlow.connect(owner).executeProposal(first_proposal_hash, unityFlow.target, description, data_1)).to.be.revertedWith("Proposal already executed");

  });

  it("should update UnityFlow balances correctly through Company and Fundraising", async function () {
      const donationETH = ethers.parseUnits("20", 18);
      const donationUF = ethers.parseUnits("100", 18);
      const investmentETH = ethers.parseUnits("30", 18);
      const investmentUF = ethers.parseUnits("200", 18);
      const currencyETH = "ETH";
      const currencyUF = "UF";

      const initialDonationsETH = await unityFlow.getTotalDonations(currencyETH);
      const initialDonationsUF = await unityFlow.getTotalDonations(currencyUF);
      const initialInvestmentsETH = await unityFlow.getTotalInvestments(currencyETH);
      const initialInvestmentsUF = await unityFlow.getTotalInvestments(currencyUF);

      const tx_investETH = await company.connect(user).investETH({ value: investmentETH });
      await tx_investETH.wait();

      const tx_approveInvestUF = await token.connect(user).approve(company.target, investmentUF);
      await tx_approveInvestUF.wait();
      const tx_investUF = await company.connect(user).investUF(investmentUF);
      await tx_investUF.wait();

      expect(await unityFlow.getTotalInvestments(currencyETH)).to.equal(initialInvestmentsETH + investmentETH);
      expect(await unityFlow.getTotalInvestments(currencyUF)).to.equal(initialInvestmentsUF + investmentUF);

      const tx_withdrawInvestmentETH = await company.connect(user).withdrawInvestmentETH(investmentETH);
      await tx_withdrawInvestmentETH.wait();
      expect(tx_withdrawInvestmentETH).to.changeEtherBalances([company, user], [-investmentETH, investmentETH]);
      expect(await unityFlow.getTotalInvestments(currencyETH)).to.equal(initialInvestmentsETH);

      const tx_withdrawInvestmentUF = await company.connect(user).withdrawInvestmentUF(investmentUF);
      await tx_withdrawInvestmentUF.wait();
      expect(tx_withdrawInvestmentUF).to.changeTokenBalances(token, [company, user], [-investmentUF, investmentUF]);
      expect(await unityFlow.getTotalInvestments(currencyUF)).to.equal(initialInvestmentsUF);

      const deadline = Math.floor(Date.now() / 1000) + 7 * SECONDS_IN_A_DAY;
      const tx_fundraising = await company.connect(owner).createFundraising(
          "Support Project", "Funding description", "tech", 1000, deadline, "image.png"
      );
      await tx_fundraising.wait();

      const fundraisingAddress = (await company.getCompanyFundraisers())[0];
      const fundraisingContract = await ethers.getContractAt("Fundraising", fundraisingAddress);

      const tx_fundraisingDonateETH = await fundraisingContract.connect(user).donateETH({ value: donationETH });
      await tx_fundraisingDonateETH.wait();

      const userAddress = await user.getAddress();
      const nonce = await token.nonces(userAddress);

      const network = await ethers.provider.getNetwork();
      const chainId = network.chainId;  

      const domain = {
          name: "TokenUF", 
          version: "1",    
          chainId: Number(chainId),      
          verifyingContract: token.target.toString(), 
      };
      
      const types = {
          Permit: [
              { name: "owner", type: "address" },
              { name: "spender", type: "address" },
              { name: "value", type: "uint256" },
              { name: "nonce", type: "uint256" },
              { name: "deadline", type: "uint256" },
          ],
      };
      
      const permitMessage = {
          owner: userAddress,
          spender: fundraisingContract.target,
          value: ethers.parseUnits("100", 18),  
          nonce: nonce,
          deadline: deadline,
      };
      
      const signature = await user.signTypedData(domain, types, permitMessage);

      const { r, s, v } = splitSignatureToRSV(signature);

      const tx_fundraisingApproveUF = await token.connect(user).approve(fundraisingContract.target, donationUF);
      await tx_fundraisingApproveUF.wait();
      const tx_fundraisingDonateUF = await fundraisingContract.connect(user).donateUF(donationUF, deadline, v, r, s);
      await tx_fundraisingDonateUF.wait();

      await time.increase(SECONDS_IN_A_DAY * 8); 
      const tx_withdrawFunds = await company.connect(owner).withdrawFromFundraising(fundraisingAddress);
      await tx_withdrawFunds.wait();

      const feeETH = BigInt(donationETH) * BigInt(5) / BigInt(100);
      const feeUF = BigInt(donationUF) * BigInt(5) / BigInt(100);

      expect(await unityFlow.getTotalDonations(currencyETH)).to.equal(
          BigInt(initialDonationsETH) + (BigInt(donationETH) - feeETH)
      );
      expect(await unityFlow.getTotalDonations(currencyUF)).to.equal(
          BigInt(initialDonationsUF) + (BigInt(donationUF) - feeUF)
      );
  });
});

interface RSV { 
  r: string;
  s: string;
  v: number;
}

function splitSignatureToRSV(signature: string): RSV {
  const r = '0x' + signature.substring(2).substring(0, 64);
  const s = '0x' + signature.substring(2).substring(64, 128);
  const v = parseInt(signature.substring(2).substring(128, 130), 16);

  return { r, s, v };
}