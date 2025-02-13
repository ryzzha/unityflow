"use client";

import { useState, useEffect } from "react";
import CustomButton from "@/components/custom-button";
import { useContractsContext } from "@/context/contracts-context";
import { Company__factory } from "@/typechain";
import { TFundraisingCategory } from "@/shared/types";
import { FUNDRAISING_CATEGORIES } from "@/shared/constants";
import { useRouter } from "next/navigation";

export default function CreateFundraisingForm() {
  const { signer, unityFlow, provider } = useContractsContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState<TFundraisingCategory>("Product");
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState<string | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (!signer || !unityFlow || !provider) {
        setError("Need connect wallet to see your companies.");
        return;
      };
      
      try {
        const userAddress = await signer.getAddress();
        const userCompanies = await unityFlow.getUserCompanies(userAddress);
        
        const activeCompanies = await Promise.all(
          userCompanies.map(async (companyAddress: string) => {
            const isActive = await unityFlow.isActiveCompany(companyAddress);
            return isActive ? companyAddress : null;
          })
        );

        const filteredCompanies = activeCompanies.filter(Boolean) as string[];
        setCompanies(filteredCompanies);
        if (filteredCompanies.length > 0) setCompany(filteredCompanies[0]); 
        setError("")
      } catch (err) {
        console.error("❌ Error fetching companies:", err);
      }
    };

    fetchUserCompanies();
  }, [signer, provider, unityFlow]);

  const createFundraising = async () => {
    setError("");

    if (!company) {
      setError("You must select an active company.");
      return;
    }

    if (!title || !description || !goal || !deadline) {
      setError("All fields are required.");
      return;
    }

    if (parseFloat(goal) <= 0) {
      setError("Goal must be greater than 0.");
      return;
    }

    const currentDate = new Date().toISOString().split("T")[0]; 
    if (deadline < currentDate) {
      setError("Deadline must be in the future.");
      return;
    }
    const timestamp = Math.floor(new Date(deadline).getTime() / 1000);

    try {
      setIsLoading(true);
      const companyContract = Company__factory.connect(company, signer);
      const tx = await companyContract.createFundraising(title, description, category, BigInt(goal), BigInt(timestamp), "");
      await tx.wait();
      alert("Fundraising successfully created!");
      setIsLoading(false);
    } catch (err) {
      console.error("❌ Error creating fundraising:", err);
      setError("Transaction failed. Check logs.");
    }
  };

  return (
    <div className="w-full z-50 flex flex-col gap-4 bg-white px-8 py-11 rounded-3xl shadow-md max-w-lg mx-auto">
      <h3 className="text-lg font-semibold text-center">Start a Fundraising</h3>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {companies.length > 0 && (
        <select
          className="border p-3 rounded-full w-full"
          value={company || ""}
          onChange={(e) => setCompany(e.target.value)}
        >
          {companies.map((comp) => (
            <option key={comp} value={comp}>
              {comp.slice(0, 6)}...{comp.slice(-4)}
            </option>
          ))}
        </select>
      )}

      <input
        type="text"
        placeholder="Title"
        className="border p-3 rounded-full w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="text"
        placeholder="Description"
        className="border p-3 rounded-full w-full"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="number"
        placeholder="Goal (USD)"
        className="border p-3 rounded-full w-full"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        min="1"
      />

      <input
        type="date"
        className="border p-3 rounded-full w-full"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        min={new Date().toISOString().split("T")[0]}
      />

      <div className="w-[90%] mx-auto flex justify-center gap-3 flex-wrap">
        {FUNDRAISING_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1 text-sm border rounded-full ${
              category === cat ? "bg-green-300 text-white" : "bg-gray-200 text-black"
            }`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="w-full mt-3 mx-auto justify-center flex gap-3">
         <CustomButton onClick={() => router.back()} variant="secondary">
           Back
         </CustomButton>
         <CustomButton onClick={createFundraising} variant="primary" disabled={!company || isLoading}>
           {isLoading ? "Starting..." : "Start Fundraising"}
         </CustomButton>
       </div>
    </div>
  );
}
