interface ICompany {
    id: bigint;
    address: string;
    name: string;
    image: string;
    description: string;
    category: string;
    founder: string;
    cofounders: string[];
    totalFundsETH: string;
    totalFundsUF: string;
    totalInvestmentsETH: string;
    totalInvestmentsUF: string;
    fundraisers: string[];
    investors: string[];
    isActive: boolean;
  }

  export type { ICompany }