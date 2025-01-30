interface Donor {
    address: string;            
    donatedAmount: number;   
}

export type FundCategory = "Education" | "Health" | "Environment" | "Social" | "Animal" | "Fun";
  
interface IFundraisingCampaign {
    campaignId: number;      
    organizer: string;      
    title: string;     
    description: string;     
    category: FundCategory;
    goalAmount: number;      
    collectedAmount: number; 
    donors: Donor[];         
    deadline: Date;         
    image: string;
}

export type { IFundraisingCampaign };