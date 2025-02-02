"use client"
import { ethers } from "ethers";
import { FundCategory, IFundraisingCampaign } from "@/shared/interfaces";
import { Crowdfunding, Campaign, Campaign__factory } from "@/typechain";

export const getAllCampaigns = async (crowdfundingContract: Crowdfunding, provider: ethers.Provider): Promise<IFundraisingCampaign[]> => {
    console.log("getAllCampaigns")
    console.log("crowdfundingContract")
    console.log(crowdfundingContract)
    console.log("provider")
    console.log(provider)
    try {
        const campaignsAdrrs =  await crowdfundingContract.getAllCampaigns();
        
        const campaigns: IFundraisingCampaign[] = await Promise.all(
            campaignsAdrrs.map(async (campaignAdrr) => {
              const campaignContract = Campaign__factory.connect(campaignAdrr, provider);
              const [
                id,
                organizer,
                title,
                description,
                image,
                category,
                goal,
                deadline,
                collected,
                claimed,
              ] = await campaignContract.getDetails();
      
              return {
                campaignId: Number(id),
                organizer,
                title,
                description,
                image,
                category: category as FundCategory,
                goalAmount: Number(goal),
                collected: Number(collected),
                deadline: new Date(Number(deadline) * 1000),
                claimed,
                donators: [],
              };
            })
          );

        console.log("campaigns in getAllCampaigns");
        console.log(campaigns);

        return campaigns;
    } catch(error) {
        console.error("❌ Помилка отримання кампаній:", error);
        return [];
    }
}