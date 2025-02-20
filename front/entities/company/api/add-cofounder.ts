import { useContractsContext } from "@/context/contracts-context";
import { Company__factory } from "@/typechain";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAddCofounder = (companyAddress: string) => {
  const { provider, signer } = useContractsContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cofounderAddress: string) => {
      if (!signer) throw new Error("No signer available");
      
      console.log("Adding cofounder...");
      const companyContract = Company__factory.connect(companyAddress, signer);
      const tx = await companyContract.addCofounder(cofounderAddress);
      await tx.wait();
      console.log("Cofounder added:", cofounderAddress);
    },
    onSuccess: () => {
      console.log("Invalidating query...");
      queryClient.invalidateQueries({ queryKey: ["company", companyAddress] });
    },
  });
};

export const useRemoveCofounder = (companyAddress: string) => {
    const { provider, signer } = useContractsContext();
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (cofounderAddress: string) => {
        if (!signer) throw new Error("No signer available");
        
        console.log("Removing cofounder...");
        const companyContract = Company__factory.connect(companyAddress, signer);
        const tx = await companyContract.removeCofounder(cofounderAddress);
        await tx.wait();
        console.log("Cofounder Removing:", cofounderAddress);
      },
      onSuccess: () => {
        console.log("Invalidating query...");
        queryClient.invalidateQueries({ queryKey: ["company", companyAddress] });
      },
    });
  };
