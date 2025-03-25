import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Company__factory, TokenUF__factory } from "@/typechain";
import { ethers } from "ethers";

export const useInvestUF = (companyAddress: string, signer: ethers.Signer, tokenAddress: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: string) => {
      const token = TokenUF__factory.connect(tokenAddress, signer);
      await token.approve(companyAddress, ethers.parseEther(amount));

      const company = Company__factory.connect(companyAddress, signer);
      const tx = await company.investUF(ethers.parseEther(amount));
      await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};
