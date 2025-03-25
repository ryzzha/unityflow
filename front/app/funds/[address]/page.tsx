"use client"

import CustomButton from "@/components/custom-button";
import { useContractsContext } from "@/context/contracts-context";
import { Fundraising__factory } from "@/typechain";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ethers, parseUnits } from "ethers";

export default function Fund() {
  const { address } = useParams();
  const { provider, signer, account } = useContractsContext();

  const [fundInfo, setFundInfo] = useState<any>(null);
  const [donateAmount, setDonateAmount] = useState("0.01");
  const [owner, setOwner] = useState<string>("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fetchFundInfo = async () => {
    if (!provider || !address) return;
    const contract = Fundraising__factory.connect(address as string, provider);
    const info = await contract.getInfo();
    const ownerAddress = await contract.owner();
    setFundInfo(info);
    setOwner(ownerAddress);
  };

  const handleDonate = async () => {
    if (!signer || !address) return;
    try {
      const contract = Fundraising__factory.connect(address as string, signer);
      const tx = await contract.donateETH({ value: ethers.parseEther(donateAmount) });
      await tx.wait();
      fetchFundInfo();
    } catch (e) {
      console.error("Donate error:", e);
    }
  };

  const handleWithdraw = async () => {
    if (!signer || !address) return;
    setIsWithdrawing(true);
    try {
      const contract = Fundraising__factory.connect(address as string, signer);
      const tx = await contract.withdrawFunds();
      await tx.wait();
      fetchFundInfo();
    } catch (e) {
      console.error("Withdraw error:", e);
    }
    setIsWithdrawing(false);
  };

  useEffect(() => {
    fetchFundInfo();
  }, [address]);

  if (!fundInfo) return <p className="text-center text-lg">Loading fund info...</p>;

  const isOwner = owner.toLowerCase() === account?.toLowerCase();

  return (
    <div className="p-6 w-full max-w-3xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold">{fundInfo[3]}</h1>
      <p className="text-gray-600">Category: {fundInfo[5]}</p>
      <p className="text-sm">Goal: ${ethers.formatUnits(fundInfo[6].toString())}</p>
      <p className="text-sm">Status: {fundInfo[8]}</p>

      {!isOwner ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Amount in ETH</label>
          <input
            type="text"
            value={donateAmount}
            onChange={(e) => setDonateAmount(e.target.value)}
            className="w-full border rounded-md p-2"
          />
          <CustomButton onClick={handleDonate}>Donate</CustomButton>
        </div>
      ) : (
        <div>
          <p className="text-green-600 font-medium">You are the owner of this fund.</p>
          <CustomButton onClick={handleWithdraw} disabled={isWithdrawing}>
            {isWithdrawing ? "Withdrawing..." : "Withdraw Funds"}
          </CustomButton>
        </div>
      )}
    </div>
  );
}