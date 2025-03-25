
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Company__factory } from "@/typechain";
import { ethers } from "ethers";

export const useInvestETH = (companyAddress: string, signer: ethers.Signer) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: string) => {
      const contract = Company__factory.connect(companyAddress, signer);
      const tx = await contract.investETH({ value: ethers.parseEther(amount) });
      await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(); 
    },
  });
};
