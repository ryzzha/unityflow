
import { ethers } from "ethers";
import { FundCategory, IFundraisingCampaign } from "@/shared/interfaces";
import { Crowdfunding, Campaign, Campaign__factory } from "@/typechain";

export const getAllCampaigns = async (crowdfundingContract: Crowdfunding, provider: ethers.Provider): Promise<IFundraisingCampaign[]> => {
    console.log("getAllCampaigns")
    try {
        const campaignsAdrrs =  await crowdfundingContract.getAllCampaigns();

        let campaigns: IFundraisingCampaign[] = [];

        campaignsAdrrs.forEach(async (campaignAdrr) => {
            const campaignContract = Campaign__factory.connect(campaignAdrr, provider);
            const [id, organizer, title, description, image, category, goal, deadline, collected, claimed] = await campaignContract.getDetails();

            const campaing: IFundraisingCampaign = {
                campaignId: Number(id),
                organizer,
                title,
                description,
                image,
                category: category as FundCategory, // Кастимо до `FundCategory`
                goalAmount: Number(goal),
                collected: Number(collected),
                deadline: new Date(Number(deadline) * 1000), // Перетворюємо Unix timestamp у дату
                claimed,
                donators: [] 
            };

            campaigns.push(campaing)
        });

        return campaigns;
    } catch(error) {
        console.error("❌ Помилка отримання кампаній:", error);
        return [];
    }
}