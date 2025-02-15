"use client";

import CustomButton from "@/components/custom-button";

export default function DAO() {
  return (
    <div className="w-full h-screen flex flex-col items-center p-6 gap-6">
      <h1 className="text-2xl font-bold">DAO Governance</h1>
      <p className="text-gray-600">Manage proposals, votes, and governance settings.</p>
      
      <div className="w-full max-w-4xl flex flex-col gap-4">
        <CustomButton variant="primary">Create Proposal</CustomButton>
        <div className="border p-4 rounded-lg w-full">
          <h2 className="text-lg font-semibold">Active Proposals</h2>
          <p className="text-gray-500">No active proposals available.</p>
        </div>
      </div>
    </div>
  );
}