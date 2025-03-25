import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setCompanies } from "./company-slice";
import { useContractsContext } from "@/context/contracts-context";
import { Company__factory } from "@/typechain";
import { ICompany } from "./types";


const fetchCompanies = async (onlyActive: boolean, provider: any, unityFlow: any, dispatch: any) => {
  if (!provider || !unityFlow) return [];

  const activeCompanies = await unityFlow.getAllCompanies(onlyActive);

  const companyData: ICompany[] = await Promise.all(
    activeCompanies.map(async (companyAddress: string) => {
      const companyContract = Company__factory.connect(companyAddress, provider);
      const [id, address, name, image, description, category, founder, isActive] = await companyContract.getCompanyInfo();

      return { id: id.toString(), address, name, image, description, category, founder, isActive };
    })
  );

  dispatch(setCompanies(companyData));

  return companyData;
};

export const useCompaniesQuery = (onlyActive: boolean) => {
  const { provider, unityFlow } = useContractsContext();
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["companies", onlyActive],
    queryFn: () => fetchCompanies(onlyActive, provider, unityFlow, dispatch),
    enabled: !!provider && !!unityFlow,
  });
};
