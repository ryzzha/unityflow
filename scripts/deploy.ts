import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Деплоїмо контракти від імені:", deployer.address);

  // Деплоїмо токен
  const TokenUFFactory = await ethers.getContractFactory("TokenUF");
  const token = await TokenUFFactory.deploy(100000);
  await token.waitForDeployment();
  console.log("TokenUF контракт деплоєно за адресою:", await token.getAddress());

  // Деплоїмо MockPriceFeed для ETH та токена
  const MockPriceFeedFactory = await ethers.getContractFactory("MockPriceFeed");
  const ethInitialPrice = ethers.parseUnits("3000", 8); // 3000$
  const tokenInitialPrice = ethers.parseUnits("5", 8); // 5$
  const ethPriceFeed = await MockPriceFeedFactory.deploy(ethInitialPrice);
  await ethPriceFeed.waitForDeployment();
  console.log("ETH PriceFeed контракт деплоєно за адресою:", await ethPriceFeed.getAddress());

  const tokenPriceFeed = await MockPriceFeedFactory.deploy(tokenInitialPrice);
  await tokenPriceFeed.waitForDeployment();
  console.log("Token PriceFeed контракт деплоєно за адресою:", await tokenPriceFeed.getAddress());

  // Деплоїмо FundraisingManager
  const FundraisingManagerFactory = await ethers.getContractFactory("FundraisingManager");
  const fundraisingManager = await FundraisingManagerFactory.deploy(token.target, ethPriceFeed.target, tokenPriceFeed.target);
  await fundraisingManager.waitForDeployment();
  console.log("FundraisingManager контракт деплоєно за адресою:", await fundraisingManager.getAddress());

  // Деплоїмо ProposalManager
  const ProposalManagerFactory = await ethers.getContractFactory("ProposalManager");
  const proposalManager = await ProposalManagerFactory.deploy(token.target);
  await proposalManager.waitForDeployment();
  console.log("ProposalManager контракт деплоєно за адресою:", await proposalManager.getAddress());

  // Деплоїмо UnityFlow
  const UnityFlowFactory = await ethers.getContractFactory("UnityFlow");
  const unityFlow = await UnityFlowFactory.deploy(
    token.target,
    fundraisingManager.target,
    proposalManager.target,
  );
  await unityFlow.waitForDeployment();
  console.log("UnityFlow контракт деплоєно за адресою:", await unityFlow.getAddress());

  // Передаємо власність токена UnityFlow
  console.log("Передаємо власність токена UnityFlow...");
  const tx = await token.transferOwnership(unityFlow.target);
  await tx.wait();
  console.log("Власність токена передана UnityFlow:", unityFlow.target);

  // Реєструємо компанію
  console.log("Реєструємо компанію...");
  const tx_create = await unityFlow.registerCompany("UnityFlow", "https://picsum.photos/200", ":)", "Web3", []);
  await tx_create.wait();
  console.log("Компанія зареєстрована!");

  console.log("Деплой завершено успішно!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
