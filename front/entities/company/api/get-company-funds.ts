import { useQuery } from "@tanstack/react-query";
import { Fundraising__factory } from "@/typechain";
import { useContractsContext } from "@/context/contracts-context";
import { ethers } from "ethers";

interface IFund {
  id: bigint;
  address: string;
  company: string;
  title: string;
  image: string;
  category: string;
  goalUSD: bigint;
  deadline: bigint;
  status: "active" | "success" | "failed";
}

const fetchFundraisers = async (fundraisers: string[], provider: ethers.Provider): Promise<IFund[]> => {
  return Promise.all(
    fundraisers.map(async (fundraiserAddress) => {
      const fundraiser = Fundraising__factory.connect(fundraiserAddress, provider);
      const [id, address, company, title, image, category, goalUSD, deadline, status] = await fundraiser.getInfo();
      return {
        id,
        company,
        address,
        title,
        image,
        category,
        goalUSD,
        deadline,
        status: status as "active" | "success" | "failed",
      };
    })
  );
};

export const useFundraisers = (fundraisers: string[]) => {
  const { provider } = useContractsContext();

  return useQuery({
    queryKey: ["fundraisers", fundraisers],
    queryFn: () => fetchFundraisers(fundraisers, provider!),
    enabled: !!provider && fundraisers.length > 0,
  });
};
