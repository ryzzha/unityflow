"use client"
import { ethers } from "ethers";
import { Crowdfunding, Campaign, Campaign__factory } from "@/typechain";
import { IFundraisingCampaign, FundCategory } from "../model/types";

export const getAllCampaigns = async (crowdfundingContract: Crowdfunding, provider: ethers.Provider): Promise<IFundraisingCampaign[]> => {
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
                collectedETH,
                collectedUF,
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
                collectedETH: Number(collectedETH),
                collectedUF: Number(collectedUF),
                deadline: new Date(Number(deadline) * 1000),
                claimed,
                donators: [],
              };
            })
        );

        return campaigns;
    } catch(error) {
        console.error("❌ Помилка отримання кампаній:", error);
        return [];
    }
}