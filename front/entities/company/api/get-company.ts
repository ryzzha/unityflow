import { useContractsContext } from "@/context/contracts-context";
import { Company__factory } from "@/typechain";
import { useQuery } from "@tanstack/react-query";
import { Contract, Provider  } from "ethers";

const fetchCompanyData = async (provider: Provider, address: string) => {
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
    totalFundsETH: totalFundsETH.toString(),
    totalFundsUF: totalFundsUF.toString(),
    totalInvestmentsETH: totalInvestmentsETH.toString(),
    totalInvestmentsUF: totalInvestmentsUF.toString(),
    fundraisers,
    investors,
    isActive,
  };
};

export const useCompany = (address: string) => {
    console.log("useCompany")
    const { provider } = useContractsContext();

    return useQuery({
        queryKey: ["company", address],
        queryFn: () => fetchCompanyData(provider!, address),
        enabled: !!(provider && address), 
        staleTime: 1000 * 60 * 5, 
        retry: 1, 
    });
};
