"use client";

import React, { useState, useEffect } from "react";
import { UnityFlowWelcome } from "@/widgets/unityFlow-welcome";
import { GlobalStatistics } from "@/widgets/global-statistics";
import { ActionsOverview } from "@/widgets/actions-overview";
import { IGlobalStatistics } from "@/shared/interfaces";
import { ethers } from "ethers";
import { useContractsContext } from "@/context/contracts-context";

const HomePage = () => {
  const { provider, unityFlow } = useContractsContext();
  const [stats, setStats] = useState<IGlobalStatistics | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!provider || !unityFlow) return;

      try {
        const result = await unityFlow.getPlatformStats();

        if (!result || result.length < 11) {
          console.error("Отримано некоректний результат з контракту");
          return;
        }

        setStats({
          companyCount: Number(result[0]), 
          totalDonationsETH: ethers.formatEther(result[1]), 
          totalDonationsUF: ethers.formatUnits(result[2]),
          totalInvestmentsETH: ethers.formatEther(result[3]),
          totalInvestmentsUF: ethers.formatUnits(result[4]),
          activeCompanies: Number(result[5]), 
          closedCompanies: Number(result[6]),
          proposalCount: Number(result[7]),
          totalVotes: Number(result[8]),
          platformBalanceETH: ethers.formatEther(result[9]),
          platformBalanceUF: ethers.formatUnits(result[10]),
        });


        console.log("Статистика отримана:", result);
      } catch (error) {
        console.error("Помилка отримання статистики:", error);
      }
    };

    fetchStats();
  }, [provider, unityFlow]);

  return (
    <div className="flex flex-col gap-5 items-center p-3">
      <UnityFlowWelcome />
      <GlobalStatistics stats={stats} />
      <ActionsOverview />
    </div>
  );
};

export default HomePage;



//
//
//

// import CustomButton from "@/components/custom-button";
// import Search from "@/components/search-input";
// import { useEffect, useState, useCallback } from "react";
// import { useContractsContext } from "@/context/contracts-context";
// import { getAllCampaigns, IFundraisingCampaign } from "@/entities/campaign";
// import FundraisingCampaign from "@/entities/campaign/ui/fundraising-campaign";
// import { useRouter } from "next/navigation";
// export default function Funds() {
//   const { provider, crowdfunding } = useContractsContext();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [category, setCategory] = useState("All");
//   const [isLoading, setIsLoading] = useState(false);
//   const [campaigns, setCampaigns] = useState<IFundraisingCampaign[]>([]);

//   const router = useRouter();

//   const fetchCampaigns = async () => {
//     setIsLoading(true);
//     try {
//       if (!provider || !crowdfunding) return;
//       const data = await getAllCampaigns(crowdfunding, provider);
//       setCampaigns(data); 
//     } catch (error) {
//       console.error("❌ Помилка отримання кампаній:", error);
//     }
//     setIsLoading(false);
//   }

//   useEffect(() => {
//       fetchCampaigns();
//   }, [provider, crowdfunding]);

//   const filteredCampaigns = campaigns.filter((campaign) => {
//     const campaignTitle = campaign.title?.toLowerCase() || "";
//     const campaignDescription = campaign.description?.toLowerCase() || "";
//     const campaignCategory = campaign.category?.toLowerCase() || "";
  
//     const matchesSearch =
//       campaignTitle.includes(searchQuery.toLowerCase()) ||
//       campaignDescription.includes(searchQuery.toLowerCase());
  
//     const matchesCategory =
//       category === "All" || campaignCategory === category.toLowerCase();
  
//     return matchesSearch && matchesCategory;
//   });

//   return (
//     <div className="w-full h-auto flex flex-col gap-5 mb-5 overflow-scroll">
//       <div className="w-full h-auto flex justify-between items-center border-2 border-orange-600">
//         <Search
//           searchQuery={searchQuery}
//           setSearchQuery={setSearchQuery}
//           category={category}
//           setCategory={setCategory}
//         />
//         <CustomButton onClick={() => router.push("create")} variant="primary">
//           Create campaign
//         </CustomButton>
//       </div>

//       <div className="w-full h-screen flex flex-col ">
//         <h3 className="text-lg font-bold mb-3">
//           All campaigns ({filteredCampaigns.length})
//         </h3>

//         {isLoading && <span>Loading...</span>}

//         <div className="w-full grid grid-cols-4 gap-6">
//           {filteredCampaigns.map((campaign) => (
//             <FundraisingCampaign key={campaign.campaignId} campaign={campaign} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }