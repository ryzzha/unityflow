"use client";

import CustomButton from "@/components/custom-button";
import Search from "@/components/search-input";
import { useEffect, useState } from "react";
import { useContractsContext } from "@/context/contracts-context";
import { useRouter } from "next/navigation";
import CompanyCard from "@/entities/company/ui/company-card";
import { ethers, Contract } from "ethers";
import { Company__factory } from "@/typechain";

interface ICompany {
  id: bigint;
  name: string;
  image: string;
  description: string;
  founder: string;
}

export default function Companies() {
  const { provider, unityFlow } = useContractsContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [onlyActive, setOnlyActive] = useState<boolean>(false);

  const router = useRouter();

  const fetchCompanies = async (onlyActive: boolean) => {
    setIsLoading(true);
    try {
      if (!provider || !unityFlow) return;
      
      const companyCount = await unityFlow.companyCount();
      const activeCompanies = await unityFlow.getAllCompanies(onlyActive);

      const companyData: ICompany[] = await Promise.all(
        activeCompanies.map(async (companyAddress: string) => {
          const companyContract = Company__factory.connect(companyAddress, provider);
          const [id, name, image, description, founder, isActive] = await companyContract.getCompanyInfo();

          return {
            id,
            name,
            image,
            description,
            founder,
            isActive,
          };
        })
      );

      setCompanies(companyData);
    } catch (error) {
      console.error("❌ Помилка отримання компаній:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCompanies(onlyActive);
  }, [provider, unityFlow]);

  const filteredCompanies = companies.filter((company) => {
    const name = company.name?.toLowerCase() || "";
    const description = company.description?.toLowerCase() || "";
    return (
      name.includes(searchQuery.toLowerCase()) ||
      description.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="w-full h-auto flex flex-col gap-5 mb-5 overflow-scroll">
      <div className="w-full h-auto flex justify-between items-center">
        <Search
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <CustomButton onClick={() => router.push("create")} variant="primary">
          Create Company
        </CustomButton>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={() => {
              setOnlyActive(!onlyActive);
              fetchCompanies(!onlyActive);
            }}
          />
          Show only active companies
        </label>
      </div>

      <div className="w-full h-screen flex flex-col">
        <h3 className="text-lg font-bold mb-3">
          All Companies ({filteredCompanies.length})
        </h3>

        {isLoading && <span>Loading...</span>}

        <div className="w-full grid grid-cols-4 gap-3">
          {filteredCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </div>
    </div>
  );
}
