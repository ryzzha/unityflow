"use client";

import CustomButton from "@/components/custom-button";
import Search from "@/components/search-input";
import { useEffect, useState } from "react";
import { useContractsContext } from "@/context/contracts-context";
import { useRouter } from "next/navigation";
import CompanyCard from "@/entities/company/ui/company-card";
import { ethers, Contract } from "ethers";
import { Company__factory } from "@/typechain";
import { useCompaniesQuery } from "@/entities/company/model/use-companies-query";
import { RootState } from "@/shared/store";
import { useSelector } from "react-redux";


export default function Companies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [onlyActive, setOnlyActive] = useState<boolean>(false);

  const router = useRouter();

  const { isLoading } = useCompaniesQuery(onlyActive);

  const companies = useSelector((state: RootState) => state.companies.companies);

  const filteredCompanies = companies.filter((company) => {
    const name = company.name?.toLowerCase() || "";
    const description = company.description?.toLowerCase() || "";

    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      description.includes(searchQuery.toLowerCase());

    const matchesCategory = category === "All" || company.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full h-auto flex flex-col gap-5 mb-5">
      <div className="w-full h-auto flex justify-between items-center">
        <Search
          type="company"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          category={category}
          setCategory={(value) => setCategory(value)}
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
              setOnlyActive(prevOnlyActive => !prevOnlyActive);
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

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </div>
    </div>
  );
}
