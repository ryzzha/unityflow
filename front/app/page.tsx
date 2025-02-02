"use client";

import CustomButton from "@/components/custom-button";
import Search from "@/components/search-input";
import { IFundraisingCampaign } from "@/shared/interfaces";
import { useEffect, useState, useCallback } from "react";
import { useContractsContext } from "@/context/contracts-context";
import { getAllCampaigns } from "@/entities/campaign";
import FundraisingCampaign from "@/entities/campaign/ui/fundraising-campaign";

export default function Home() {
  const { provider, crowdfunding } = useContractsContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<IFundraisingCampaign[]>([]);

  console.log("🔄 Ререндер Home");
  console.log("📊 Кампанії:", campaigns);
  console.log("Провайдер:",provider);
  console.log("Кровфандинг:",crowdfunding);

  const fetchCampaigns = async () => {
    console.log("fetchCampaigns func");
    setIsLoading(true);
    try {
      if (!provider || !crowdfunding) return;
      const data = await getAllCampaigns(crowdfunding, provider);
      setCampaigns(data); 
    } catch (error) {
      console.error("❌ Помилка отримання кампаній:", error);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    console.log("useEffect home");
    if (provider && crowdfunding) {
      fetchCampaigns();
    }
  }, [provider, crowdfunding]);

  const filteredCampaigns = campaigns.filter((campaign) => {
    console.log("filteredCampaigns calculate");
    const campaignTitle = campaign.title?.toLowerCase() || "";
    const campaignDescription = campaign.description?.toLowerCase() || "";
    const campaignCategory = campaign.category?.toLowerCase() || "";
  
    const matchesSearch =
      campaignTitle.includes(searchQuery.toLowerCase()) ||
      campaignDescription.includes(searchQuery.toLowerCase());
  
    const matchesCategory =
      category === "All" || campaignCategory === category.toLowerCase();
  
    return matchesSearch && matchesCategory;
  });

  console.log("📊 фільтп Кампанії:", filteredCampaigns);

  if (!provider || !crowdfunding) {
    return <div>Loading blockchain data...</div>;
  }

  return (
    <div className="w-full h-screen flex flex-col gap-5">
      <div className="w-full h-auto flex justify-between items-center border-2 border-orange-600">
        <Search
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          category={category}
          setCategory={setCategory}
        />
        <CustomButton onClick={() => alert("Primary!")} variant="primary">
          Create campaign
        </CustomButton>
      </div>

      <div className="w-full h-screen flex flex-col">
        <h3 className="text-lg font-bold mb-3">
          All campaigns ({filteredCampaigns.length})
        </h3>

        {isLoading && <span>Loading...</span>}

        <div className="w-full grid grid-cols-4 gap-6 overflow-scroll">
          {filteredCampaigns.map((campaign) => (
            <FundraisingCampaign key={campaign.campaignId} campaign={campaign} />
          ))}
        </div>
      </div>
    </div>
  );
}
