"use client";

import { useState } from "react";
import { useContractsContext } from "@/context/contracts-context";
import { CreateCompanyForm } from "@/entities/company";
import { CreateFundraisingForm } from "@/entities/fund";
import { CreateProposalForm } from "@/entities/proposal";

const tabs = [
  { id: "company", label: "Create Company" },
  { id: "fundraising", label: "Create Fundraising" },
  { id: "proposal", label: "Create Proposal" },
];

export default function CreateCampaign() {
  const { provider, signer, unityFlow } = useContractsContext();
  const [activeTab, setActiveTab] = useState("company");

  return (
    <div className="w-full h-screen flex flex-col gap-2 py-3 items-center">
      <h2 className="text-2xl font-bold">Create New Entity</h2>

      <div className="flex space-x-3 border-b pb-1 transition-all duration-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-t-lg shadow-md text-white font-semibold text-sm  ${
              activeTab === tab.id ? "bg-green-400/85" : "bg-gray-300/95"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-3xl mt-3">
        {activeTab === "company" && <CreateCompanyForm />}
        {activeTab === "fundraising" && <CreateFundraisingForm />}
        {activeTab === "proposal" && <CreateProposalForm />}
      </div>
    </div>
  );
}
