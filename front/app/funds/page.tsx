"use client";

import CustomButton from "@/components/custom-button";
import Search from "@/components/search-input";
import { useEffect, useState } from "react";
import { useContractsContext } from "@/context/contracts-context";
import { useRouter } from "next/navigation";
import FundCard from "@/entities/fund/ui/fund-card";
import { ethers, Contract } from "ethers";
import { Fundraising__factory } from "@/typechain";

type TStatus = "active" | "success" | "failed";

interface IFund {
  id: bigint;
  address: string;
  company: string;
  title: string;
  image: string;
  category: string;
  goalUSD: bigint;
  deadline: bigint;
  status: TStatus;
}

export default function Funds() {
  const { provider, unityFlow } = useContractsContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [funds, setFunds] = useState<IFund[]>([]);
  const [onlyActive, setOnlyActive] = useState<boolean>(false);

  const router = useRouter();

  const fetchFunds = async (onlyActive: boolean) => {
    setIsLoading(true);
    try {
      if (!provider || !unityFlow) return;
      
      const activeFunds = await unityFlow.getAllFundraisers(onlyActive);

      const fundData: IFund[] = await Promise.all(
        activeFunds.map(async (fundAddress: string) => {
          const fundContract = Fundraising__factory.connect(fundAddress, provider);
          const [id, address, company, title, image, category, goalUSD, deadline, status] = await fundContract.getInfo();

          return {
            id,
            address,
            company,
            title,
            image,
            category,
            goalUSD,
            deadline,
            status: status as TStatus,
          };
        })
      );

      setFunds(fundData);
    } catch (error) {
      console.error("❌ Помилка отримання фондів:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFunds(onlyActive);
  }, [provider, unityFlow]);

  const filteredFunds = funds.filter((fund) => {
    const title = fund.title.toLowerCase() || "";
    const companyName = fund.company.toLowerCase() || "";

    const categoryMatch = category === "All" || fund.category === category;
    const searchMatch =
        title.includes(searchQuery.toLowerCase().trim()) ||
        companyName.includes(searchQuery.toLowerCase().trim());

    return categoryMatch && searchMatch;
  }).slice().reverse();


  return (
    <div className="w-full h-auto flex flex-col gap-5 mb-5 ">
      <div className="w-full h-auto flex justify-between items-center">
        <Search
          type="fund"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          category={category}
          setCategory={(value) => setCategory(value)}
        />
        <CustomButton onClick={() => router.push("create-fund")} variant="primary">
          Create Fund
        </CustomButton>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={() => {
              setOnlyActive(!onlyActive);
              fetchFunds(!onlyActive);
            }}
          />
          Show only active funds
        </label>
      </div>

      <div className="w-full h-screen flex flex-col">
        <h3 className="text-lg font-bold mb-3">
          All Funds ({filteredFunds.length})
        </h3>

        {isLoading && <span>Loading...</span>}

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredFunds.map((fund, index) => (
            <FundCard key={index} fund={fund} />
          ))}
        </div>
      </div>
    </div>
  );
}
