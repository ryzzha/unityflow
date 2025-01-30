"use client"
import CustomButton from "@/components/custom-button";
import FundraisingCampaign from "@/components/fundraising-campaign";
import Loader from "@/components/loader";
import Search from "@/components/search-input";
import { IFundraisingCampaign } from "@/shared/interfaces";
import { testCampaigns } from "@/shared/test-fund-data";
import { useEffect, useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaings] = useState<IFundraisingCampaign[]>([]);

  const fetchCampaings = async () => {
    setIsLoading(true);
    // const data = await getCampaings();
    setCampaings(testCampaigns);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchCampaings();
  }, [campaigns, searchQuery, category]);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      category === "All" ||
      campaign.category.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full h-screen flex flex-col gap-5">

      <div className="w-full h-auto flex justify-between items-center border-2 border-orange-600">
        <Search searchQuery={searchQuery} setSearchQuery={(value) => setSearchQuery(value)} category={category} setCategory={(value) => setCategory(value)} />
        <CustomButton onClick={() => alert("Primary!")} variant="primary">
          Create campaign
        </CustomButton>

      </div>

      <div className="w-full h-screen flex flex-col">
        <h3 className="text-lg font-bold mb-3">All campaigns ({filteredCampaigns.length})</h3>

        { isLoading && <Loader /> }

        <div className="w-full grid grid-cols-4 gap-6 overflow-scroll">
            {filteredCampaigns.map((campaign) => <FundraisingCampaign key={campaign.campaignId} campaign={campaign}  />)}
        </div>
      </div>
    </div>
  );
}
