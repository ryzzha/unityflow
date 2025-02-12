"use client";

import { useState, useEffect } from "react";
import CustomButton from "@/components/custom-button";
import { useContractsContext } from "@/context/contracts-context";
import { Company__factory } from "@/typechain";
import { TFundraisingCategory } from "@/shared/types";
import { FUNDRAISING_CATEGORIES } from "@/shared/constants";


export default function CreateFundraisingForm() {
  const { signer, unityFlow, provider } = useContractsContext();
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState<TFundraisingCategory>("Product");
  const [company, setCompany] = useState<string | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (!signer || !unityFlow) return;
      
      try {
        const userAddress = await signer.getAddress();
        const userCompanies = await unityFlow.getUserCompanies(userAddress);
        
        // Фільтруємо тільки активні компанії
        const activeCompanies = await Promise.all(
          userCompanies.map(async (companyAddress: string) => {
            const isActive = await unityFlow.isCompanyActive(companyAddress);
            return isActive ? companyAddress : null;
          })
        );

        const filteredCompanies = activeCompanies.filter(Boolean) as string[];
        setCompanies(filteredCompanies);
        if (filteredCompanies.length > 0) setCompany(filteredCompanies[0]); // Вибираємо першу активну компанію
      } catch (err) {
        console.error("❌ Error fetching companies:", err);
      }
    };

    fetchUserCompanies();
  }, [signer, unityFlow]);

  const createFundraising = async () => {
    setError("");

    if (!company) {
      setError("You must select an active company.");
      return;
    }

    if (!title || !goal || !deadline) {
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

    try {
      const companyContract = Company__factory.connect(company, signer);
      const tx = await companyContract.createFundraising(title, "", category, goal, deadline, "");
      await tx.wait();
      alert("Fundraising successfully created!");
    } catch (err) {
      console.error("❌ Error creating fundraising:", err);
      setError("Transaction failed. Check logs.");
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
      <h3 className="text-lg font-semibold text-center">Start a Fundraising</h3>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {/* Вибір компанії (показується, якщо є компанії) */}
      {companies.length > 0 ? (
        <select
          className="border p-3 rounded-md w-full"
          value={company || ""}
          onChange={(e) => setCompany(e.target.value)}
        >
          {companies.map((comp) => (
            <option key={comp} value={comp}>
              {comp.slice(0, 6)}...{comp.slice(-4)}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-red-500 text-sm text-center">No active companies found.</p>
      )}

      <input
        type="text"
        placeholder="Title"
        className="border p-3 rounded-md w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="number"
        placeholder="Goal (USD)"
        className="border p-3 rounded-md w-full"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        min="1"
      />

      <input
        type="date"
        className="border p-3 rounded-md w-full"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        min={new Date().toISOString().split("T")[0]}
      />

      {/* Вибір категорії */}
      <div className="flex gap-2 flex-wrap">
        {FUNDRAISING_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 border rounded-full ${
              category === cat ? "bg-green-300 text-white" : "bg-gray-200 text-black"
            }`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <CustomButton onClick={createFundraising} variant="primary" disabled={!company}>
        Start Fundraising
      </CustomButton>
    </div>
  );
}
