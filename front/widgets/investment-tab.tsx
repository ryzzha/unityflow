import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useInvestETH } from "@/features/invest/useInvestETH";
import { useInvestUF } from "@/features/invest/useInvestUF";
import { useContractsContext } from "@/context/contracts-context";
import { Company__factory } from "@/typechain";
import CustomButton from "@/components/custom-button";

const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

interface Props {
  companyAddress: string;
}

export const InvestmentTab = ({ companyAddress }: Props) => {
  const { signer, account, provider } = useContractsContext();

  const [ethAmount, setEthAmount] = useState("0.01");
  const [ufAmount, setUfAmount] = useState("10");
  const [dividends, setDividends] = useState({ eth: "0", uf: "0" });

  const { mutate: investETH, isPending: isInvestingETH } = useInvestETH(companyAddress, signer!);
  const { mutate: investUF, isPending: isInvestingUF } = useInvestUF(companyAddress, signer!, tokenAddress);

  const fetchDividends = async () => {
    if (!provider || !account || !companyAddress) return;
    try {
      const contract = Company__factory.connect(companyAddress, provider);
      const [ethDividends, ufDividends] = await contract.getInvestorDividends(account);
      setDividends({
        eth: ethers.formatEther(ethDividends ?? 0),
        uf: ethers.formatEther(ufDividends ?? 0),
      });
    } catch (error) {
      console.error("Error fetching dividends:", error);
    }
  };

  const withdrawDividends = async () => {
    if (!signer || !companyAddress) return;
    try {
      const contract = Company__factory.connect(companyAddress, signer);
      const tx1 = await contract.withdrawDividendsETH();
      await tx1.wait();

      const tx2 = await contract.withdrawDividendsUF();
      await tx2.wait();

      await fetchDividends();
    } catch (error) {
      console.error("Error withdrawing dividends:", error);
    }
  };

  useEffect(() => {
    fetchDividends();
  }, [account, companyAddress]);

  return (
    <div className="space-y-6 text-sm text-gray-700">
      <div>
        <h2 className="text-lg font-semibold mb-3">💰 Invest in Company</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
            <label className="block text-sm font-medium mb-1">ETH Amount</label>
            <input
              type="text"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              className="w-full p-2 rounded-md border"
            />
            <CustomButton
              className="mt-2 w-full"
              onClick={() => investETH(ethAmount)}
              disabled={isInvestingETH}
            >
              {isInvestingETH ? "Investing..." : "Invest ETH"}
            </CustomButton>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
            <label className="block text-sm font-medium mb-1">UF Amount</label>
            <input
              type="text"
              value={ufAmount}
              onChange={(e) => setUfAmount(e.target.value)}
              className="w-full p-2 rounded-md border"
            />
            <CustomButton
              className="mt-2 w-full"
              onClick={() => investUF(ufAmount)}
              disabled={isInvestingUF}
            >
              {isInvestingUF ? "Investing..." : "Invest UF"}
            </CustomButton>
          </div>
        </div>
      </div>

      <div>
      <h2 className="text-lg font-semibold mb-3">🎁 My Dividends</h2>
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm space-y-3">
          <p>
            <strong>ETH:</strong> {dividends.eth}
          </p>
          <p>
            <strong>UF:</strong> {dividends.uf}
          </p>
          <CustomButton onClick={withdrawDividends}>
            Withdraw All Dividends
          </CustomButton>
        </div>
      </div>
    </div>
  );
};
