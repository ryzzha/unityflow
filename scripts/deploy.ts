import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Деплоїмо контракти від імені:", deployer.address);

  // --- 1. Деплой токена ---
  const TokenUFFactory = await ethers.getContractFactory("TokenUF");
  const token = await TokenUFFactory.deploy(100000);
  await token.waitForDeployment();
  console.log("✅ TokenUF деплоєно за адресою:", await token.getAddress());

  // --- 2. Chainlink Aggregators (реальні в Sepolia) ---
  const ETH_USD_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // ETH/USD
  const UF_USD_FAKE_FEED = ETH_USD_FEED; // Для тесту — однаково з ETH/USD (або заміни на інший)

  // --- 3. Деплой CompanyManager ---
  const CompanyManagerFactory = await ethers.getContractFactory("CompanyManager");
  const companyManager = await CompanyManagerFactory.deploy(token.target);
  await companyManager.waitForDeployment();
  console.log("✅ CompanyManager:", await companyManager.getAddress());

  // --- 4. Деплой FundraisingManager ---
  const FundraisingManagerFactory = await ethers.getContractFactory("FundraisingManager");
  const fundraisingManager = await FundraisingManagerFactory.deploy(
    token.target,
    ETH_USD_FEED,
    UF_USD_FAKE_FEED
  );
  await fundraisingManager.waitForDeployment();
  console.log("✅ FundraisingManager:", await fundraisingManager.getAddress());

  // --- 5. Деплой ProposalManager ---
  const ProposalManagerFactory = await ethers.getContractFactory("ProposalManager");
  const proposalManager = await ProposalManagerFactory.deploy(token.target);
  await proposalManager.waitForDeployment();
  console.log("✅ ProposalManager:", await proposalManager.getAddress());

  // --- 6. Деплой UnityFlow ---
  const UnityFlowFactory = await ethers.getContractFactory("UnityFlow");
  const unityFlow = await UnityFlowFactory.deploy(
    token.target,
    companyManager.target,
    fundraisingManager.target,
    proposalManager.target
  );
  await unityFlow.waitForDeployment();
  console.log("✅ UnityFlow:", await unityFlow.getAddress());

  // --- 7. Передаємо власність токена ---
  const tx = await token.transferOwnership(unityFlow.target);
  await tx.wait();
  console.log("🔐 Власність токена передана UnityFlow:", unityFlow.target);

  // --- 8. Реєструємо першу компанію ---
  const registerTx = await unityFlow.registerCompany(
    "UnityFlow",
    "https://picsum.photos/200",
    ":)",
    "Web3",
    []
  );
  await registerTx.wait();
  console.log("🏢 Компанія зареєстрована");

  console.log("🎉 Деплой завершено успішно!");
}

main().catch((error) => {
  console.error("❌ Помилка при деплої:", error);
  process.exitCode = 1;
});
