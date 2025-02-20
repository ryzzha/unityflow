import { ethers } from "ethers";
import { useContractsContext } from "@/context/contracts-context";
import { Company__factory } from "@/typechain";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Contract, Provider  } from "ethers";
import { ICompany } from "../model/types";

const fetchCompanyData = async (provider: Provider, address: string): Promise<ICompany> => {
  console.log("fetchCompanyData")
  const companyContract = Company__factory.connect(address.toString(), provider);
  const {
    companyId,
    companyAddress,
    name,
    image,
    description,
    category,
    founder,
    cofounders,
    totalFundsETH,
    totalFundsUF,
    totalInvestmentsETH,
    totalInvestmentsUF,
    fundraisers,
    investors,
    isActive
  } = await companyContract.getCompanyDetails();

  return {
    id: companyId,
    address: companyAddress,
    name,
    image,
    description,
    category,
    founder,
    cofounders,
    totalFundsETH: ethers.formatEther(totalFundsETH.toString()),
    totalFundsUF: ethers.formatUnits(totalFundsUF.toString(), 18),
    totalInvestmentsETH: ethers.formatEther(totalInvestmentsETH.toString()),
    totalInvestmentsUF: ethers.formatUnits(totalInvestmentsUF.toString(), 18),
    fundraisers,
    investors,
    isActive,
  };
};

export const useCompany = (address: string): UseQueryResult<ICompany, Error> => {
    console.log("useCompany")
    const { provider } = useContractsContext();

    return useQuery({
        queryKey: ["company", address],
        queryFn: () => fetchCompanyData(provider!, address),
        enabled: !!(provider && address), 
        staleTime: 1000 * 60 * 5, 
        retry: 1, 
        structuralSharing: false,
    });
};
