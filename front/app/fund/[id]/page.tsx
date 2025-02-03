"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CustomButton from "@/components/custom-button";
import { useContractsContext } from "@/context/contracts-context";
import { IFundraisingCampaign } from "@/entities/campaign";
import { Campaign__factory, Campaign } from "@/typechain";
import { formatCampaignData } from "@/shared/helpers/format-campaign-data";
import { parseEther, formatEther } from "ethers";
import { TypedDeferredTopicFilter, TypedContractEvent } from "@/typechain/common";
import { DonationReceivedEvent } from "@/typechain/contracts/Crowdfunding.sol/Campaign";

export default function CampaignPage() {
  const { wsProvider, signer, crowdfunding } = useContractsContext();
  const [campaignContract, setCampaignContract] = useState<Campaign | null>(null);
  const [campaign, setCampaign] = useState<IFundraisingCampaign | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donators, setDonators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!wsProvider || !crowdfunding || !id) return;
      try {
        setIsLoading(true);
        const campaignAddress = await crowdfunding.getCampaignAddress(Number(id));
        const campaignContract = Campaign__factory.connect(campaignAddress, wsProvider);
        setCampaignContract(campaignContract);
        const data = await campaignContract.getDetails();
        const formattedCampaign = formatCampaignData(data);
        setCampaign(formattedCampaign);
      } catch (error) {
        console.error("Error fetching campaign:", error);
      }
      setIsLoading(false);
    };
    fetchCampaign();
  }, [wsProvider, crowdfunding, id]);

  useEffect(() => {
    if (!campaignContract) return;

    const fetchPastDonations = async () => {
      try {
        const donationEvents = await campaignContract.queryFilter(
          campaignContract.filters.DonationReceived()
        );

        const pastDonators = donationEvents.map((event) => ({
          address: event.args?.donator,
          amount: formatEther(event.args?.amount),
          currency: event.args?.currency,
        }));

        setDonators(pastDonators);
      } catch (error) {
        console.error("Error fetching past donations:", error);
      }
    };

    fetchPastDonations();

    const handleNewDonation = (donator: string, amount: bigint, currency: string) => {
        console.log(`🔥 New donation from ${donator}: ${formatEther(amount)} ${currency}`);
    
        setDonators((prev) => [
          ...prev,
          {
            address: donator,
            amount: formatEther(amount),
            currency,
          },
        ]);
      };

    //   const filters = campaignContract.filters.DonationReceived(); if use it in contract.on dont work ???

      type donationFilter = TypedDeferredTopicFilter<TypedContractEvent<DonationReceivedEvent.InputTuple, DonationReceivedEvent.OutputTuple, DonationReceivedEvent.OutputObject>>;
    
      console.log("🔗 Subscribing to DonationReceived events...");
      campaignContract.on("DonationReceived" as any as donationFilter, handleNewDonation);
    
      return () => {
        console.log("❌ Unsubscribing from DonationReceived events...");
        campaignContract.off("DonationReceived", handleNewDonation);
      };
  }, [wsProvider, campaignContract]);

  const donateETH = async () => {
    if (!wsProvider || !campaignContract) return;

    campaignContract.connect(signer).donateETH({value: parseEther(donationAmount)});
  }

  if (isLoading) return <div className="text-center text-lg">Loading...</div>;
  if (!campaign) return <div className="text-center text-lg">Campaign not found</div>;

  return (
    <div className="w-full h-screen flex flex-col gap-5 py-5 items-center">
      <div className="w-full px-16 py-11 flex flex-col gap-4 bg-white rounded-lg shadow-lg">
        <div className="w-32 h-32 inset-x-0 mx-auto rounded-full overflow-hidden border-4 border-gray-300">
            <Image
            src={campaign.image}
            alt={campaign.title}
            width={128}
            height={128}
            className="object-cover rounded-full"
            />
        </div>
        <h1 className="text-2xl font-bold text-center">{campaign.title}</h1>
        <p className="text-gray-600 text-center">{campaign.description}</p>
        <span className="px-4 py-2 bg-yellow-300 bg-opacity-85 text-white rounded-full self-center">
          {campaign.category}
        </span>
        <div className="flex flex-col gap-2 text-base text-gray-700">
          <p><strong>Organizer:</strong> {campaign.organizer}</p>
          <p><strong>Goal:</strong> {formatEther(BigInt(campaign.goalAmount).toString())} ETH</p>
          <p><strong>Collected:</strong> {formatEther(BigInt(campaign.collectedETH).toString())} ETH</p>
          <p><strong>Deadline:</strong> {campaign.deadline.toLocaleDateString()}</p>
        </div>
        <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2 items-center mt-4">
                <input
                    type="number"
                    placeholder="Enter amount in ETH"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="max-w-52 border p-1 rounded-md w-full text-base text-center"
                />
                <CustomButton variant="primary" onClick={() => donateETH()}>Donate</CustomButton>
            </div>
          <span className="text-gray-500">
            {campaign.claimed ? "Funds claimed" : "Funds not yet claimed"}
          </span>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-3">Recent Donors</h3>
          {donators.length > 0 ? (
            <ul className="border rounded-md flex flex-col gap-1 px-5 py-1 bg-gray-100 max-h-60 overflow-auto">
              {donators.map((donor, index) => (
                <li key={index} className="flex justify-between border-b py-2 last:border-none">
                  <span className="font-semibold">{donor.address}</span>
                  <span>{donor.amount} {donor.currency}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No donors yet</p>
          )}
        </div>
      </div>
    </div>
  );
}



// const listenToDonations = (campaignContract: ethers.Contract, setDonators: Function) => {
//     campaignContract.on("DonationReceived", (donator, amount, currency) => {
//       console.log(`New donation from ${donator}: ${ethers.utils.formatEther(amount)} ${currency}`);
      
//       setDonators((prev: any[]) => [
//         ...prev,
//         {
//           address: donator,
//           amount: ethers.utils.formatEther(amount),
//           currency,
//         },
//       ]);
//     });
//   };