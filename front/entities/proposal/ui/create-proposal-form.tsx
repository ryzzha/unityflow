"use client";

import { useState } from "react";
import CustomButton from "@/components/custom-button";

export default function CreateProposalForm() {
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const createProposal = async () => {
    console.log("Creating proposal:", description, deadline);
    // Логіка смарт-контракту
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Submit a Proposal</h3>
      <textarea
        placeholder="Proposal Description"
        className="border p-3 rounded-md w-full"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="date"
        className="border p-3 rounded-md w-full"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <CustomButton onClick={createProposal} variant="primary">
        Submit Proposal
      </CustomButton>
    </div>
  );
}
