"use client"
import { ethers } from "ethers";
import { UnityFlow, Company, Company__factory } from "@/typechain";
import { IFundraisingCampaign, FundCategory } from "../model/types";

export const getAllCampaigns = async (unityFlowContract: UnityFlow, provider: ethers.Provider): Promise<IFundraisingCampaign[]> => {
    try {
        const campaignsAdrrs =  await unityFlowContract.getAllCompanies(true);

        const campaigns: any[] = await Promise.all(
            campaignsAdrrs.map(async (campaignAdrr) => {
              const campaignContract = Company__factory.connect(campaignAdrr, provider);
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
              ] = await campaignContract.getCompanyDetails();
      
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