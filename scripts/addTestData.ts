import { Addressable } from "ethers";
import { ethers } from "hardhat";

async function main() {
  const [deployer, founder, cofounder, investor, richUser, user, poorUser] = await ethers.getSigners();
  console.log("Виконуємо тестовий деплой від імені:", deployer.address);

  const unityFlowAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"; 
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

  const UnityFlow = await ethers.getContractAt("UnityFlow", unityFlowAddress);
  const TokenUF = await ethers.getContractAt("TokenUF", tokenAddress);

  console.log("🔹 Роздача токенів користувачам...");
   // 🔸 1️⃣ Роздаємо токени користувачам
   const amount = ethers.parseUnits("5000", 18);
   const amountForRich = ethers.parseUnits("30000", 18);
 
   interface IRecipients {
     address: string,
     amount: bigint,
   }
 
   const recipients: IRecipients[] = [
     { address: founder.address, amount },
     { address: cofounder.address, amount },
     { address: investor.address, amount },
     { address: user.address, amount },
     { address: richUser.address, amount: amountForRich },
     { address: poorUser.address, amount: ethers.parseUnits("1", 18) }
   ];
 
   for (const recipient of recipients) {
     const tx = await TokenUF.connect(deployer).transfer(recipient.address, recipient.amount);
     await tx.wait();
     console.log(`✅ ${recipient.amount} токенів передано користувачу ${recipient.address}`);
   }

  const companyNames = ["Web3Tech", "GreenFuture", "AIStartup"];
  let companyContracts: any[] = [];

  console.log("🔹 Починаємо створення компаній...");

  const companyManager = await ethers.getContractAt("CompanyManager", UnityFlow.companyManager.toString());

  const category = ["Tech","Web3","FinTech","Security","Marketing","Gaming","SaaS","E-commerce"];

  // 🔸 12️⃣ Реєструємо компанії
  for (const name of companyNames) {
    console.log(`Реєстрація компанії: ${name}...`);
    const image = "https://picsum.photos/200";
    const description = `A decentralized company ${name}`;
    const cofounders: Addressable[] = [];
    const tx = await UnityFlow.connect(founder).registerCompany(name, image, description, category[getRandomInt(0, category.length)], cofounders);
    await tx.wait();

    const companyIndex = await companyManager.companyCount();
    const companyAddress = await companyManager.companies(companyIndex);
    const companyContract = await ethers.getContractAt("Company", companyAddress);

    companyContracts.push(companyContract);
    console.log(`✅ ${name} зареєстровано за адресою: ${companyAddress}`);
  }

  console.log("🔹 Починаємо створення фондів для компаній...");

  // 🔸 3️⃣ Створюємо по 2 фонди для кожної компанії від імені засновника
  for (const company of companyContracts) {
    console.log(`📌 Створюємо фонди для компанії: ${await company.name()}...`);

    for (let i = 1; i <= 2; i++) {
      const goalUSD = (1000 * i).toString(); // Цільова сума (1000$ і 2000$)
      const deadline = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // Дедлайн через 30 днів

      const tx = await company.connect(founder).createFundraising(
        `Фонд #${i} для ${await company.name()}`,
        "Опис фонду",
        "Категорія",
        goalUSD,
        deadline,
        "image_url"
      );
      await tx.wait();

      console.log(`✅ Фонд #${i} створено для компанії ${await company.name()}!`);
    }
  }

  console.log("🎉 Тестові дані успішно створені!");
}

main().catch((error) => {
  console.error("❌ Помилка під час деплою тестових даних:", error);
  process.exitCode = 1;
});

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);  // Округлюємо вгору, щоб уникнути дробових значень
  max = Math.floor(max); // Округлюємо вниз, щоб залишитися в межах діапазону
  return Math.floor(Math.random() * (max - min + 1)) + min;
}