import { ethers } from "hardhat";

const CROWDFUNDING_ADDRESS = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9"; // Замініть на вашу адресу контракту Crowdfunding

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Додаємо тестові кампанії від імені:", deployer.address);

    const crowdfunding = await ethers.getContractAt("Crowdfunding", CROWDFUNDING_ADDRESS, deployer);

    const testCampaigns = [
        { title: "Освітній проект", description: "Підтримка навчальних курсів", category: "Startups", goal: ethers.parseEther("10"), deadline: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, image: "https://loremflickr.com/400/250?random=1" },
        { title: "Технологічний стартап", description: "Інноваційний AI продукт", category: "Social", goal: ethers.parseEther("20"), deadline: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60, image: "https://loremflickr.com/400/250?random=2" },
        { title: "Соціальна ініціатива", description: "Допомога безхатченкам", category: "Health", goal: ethers.parseEther("5"), deadline: Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60, image: "https://loremflickr.com/400/250?random=3" },
        { title: "Екологічний проект", description: "Посадка дерев у містах", category: "Social", goal: ethers.parseEther("8"), deadline: Math.floor(Date.now() / 1000) + 20 * 24 * 60 * 60, image: "https://loremflickr.com/400/250?random=4" },
        { title: "Музичний фестиваль", description: "Підтримка молодих музикантів", category: "Personal", goal: ethers.parseEther("15"), deadline: Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60, image: "https://loremflickr.com/400/250?random=5" },
    ];

    for (const campaign of testCampaigns) {
        const tx = await crowdfunding.createCampaign(
            campaign.title,
            campaign.description,
            campaign.category,
            campaign.goal,
            campaign.deadline,
            campaign.image
        );
        await tx.wait();
        console.log(`✅ Кампанія "${campaign.title}" створена!`);
    }

    // Виведемо всі кампанії після створення
    const campaigns = await crowdfunding.getAllCampaigns();
    console.log("🎯 Список створених кампаній:", campaigns);
}

main().catch((error) => {
    console.error("❌ Помилка під час додавання кампаній:", error);
    process.exitCode = 1;
});
