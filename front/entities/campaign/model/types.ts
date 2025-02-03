interface Donor {
    address: string;            
    donatedAmount: number;   
}

export type FundCategory = "All" | "Startups" | "Art" |"Fun" | "Education" | "Health" | "Environment" | "Social" | "Animals" |  "Personal";

export interface IFundraisingCampaign {
    campaignId: number;      
    organizer: string;      
    title: string;     
    description: string;     
    image: string;
    category: FundCategory;
    goalAmount: number;      
    collectedETH: number;      
    collectedUF: number;      
    deadline: Date;         
    claimed: boolean;
    donators: Donor[];    
}
