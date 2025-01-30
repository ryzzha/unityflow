interface Donor {
    address: string;            
    donatedAmount: number;   
}

export type FundCategory = "All" | "Startups" | "Art" |"Fun" | "Education" | "Health" | "Environment" | "Social" | "Animals" |  "Personal";

interface IFundraisingCampaign {
    campaignId: number;      
    organizer: string;      
    title: string;     
    description: string;     
    image: string;
    category: FundCategory;
    goalAmount: number;      
    collected: number;      
    deadline: Date;         
    claimed: boolean;
    donators: Donor[];    
}

export type { IFundraisingCampaign };