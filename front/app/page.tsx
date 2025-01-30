"use client"
import CustomButton from "@/components/custom-button";
import FundraisingCampaign from "@/components/fundraising-campaign";
import Loader from "@/components/loader";
import Search from "@/components/search-input";
import { IFundraisingCampaign } from "@/shared/interfaces";
import { testCampaigns } from "@/shared/test-fund-data";
import { useEffect, useState } from "react";

export default function Home() {
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
  }, [campaigns]);

  return (
    <div className="w-full h-screen flex flex-col gap-5">

      <div className="w-full h-auto flex justify-between items-center border-2 border-orange-600">
        <Search />
        <CustomButton onClick={() => alert("Primary!")} variant="primary">
          Create campaign
        </CustomButton>

      </div>

      <div className="w-full h-screen flex flex-col">
        <h3 className="text-lg font-bold mb-3">All campaigns ({campaigns.length})</h3>

        { isLoading && <Loader /> }

        <div className="w-full grid grid-cols-4 gap-6 overflow-scroll">
            {campaigns.map((campaign) => <FundraisingCampaign key={campaign.campaignId} campaign={campaign}  />)}
        </div>
      </div>
    </div>
  );
}
