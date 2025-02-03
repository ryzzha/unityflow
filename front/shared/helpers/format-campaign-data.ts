import { IFundraisingCampaign, FundCategory } from "@/entities/campaign";

export function formatCampaignData(rawData: any[]): IFundraisingCampaign {
  return {
    campaignId: Number(rawData[0]),
    organizer: rawData[1],
    title: rawData[2],
    description: rawData[3],
    image: rawData[4],
    category: rawData[5] as FundCategory,
    goalAmount: Number(rawData[6]),
    deadline: new Date(Number(rawData[7]) * 1000), 
    collectedETH: Number(rawData[8]),
    collectedUF: Number(rawData[9]),
    claimed: rawData[10],
    donators: [], 
  };
}