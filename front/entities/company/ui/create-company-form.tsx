"use client";

import { useState, useEffect } from "react";
import ethers, {formatUnits} from "ethers"
import CustomButton from "@/components/custom-button";
import { useContractsContext } from "@/context/contracts-context";
import { useRouter } from "next/navigation";

export default function CreateCompanyForm() {
  const { signer, unityFlow, tokenUF } = useContractsContext();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [cofounders, setCofounders] = useState<string[]>([]);
  const [cofounderInput, setCofounderInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const requiredTokens = 100;

  const router = useRouter();

  useEffect(() => {
    const fetchBalance = async () => {
      if (signer && tokenUF) {
        const userAddress = await signer.getAddress();
        const balanceWei = await tokenUF.balanceOf(userAddress);
        setBalance(formatUnits(balanceWei, 18)); 
      }
    };
    fetchBalance();
  }, [signer, tokenUF]);

  const addCofounder = () => {
    if (cofounderInput && !cofounders.includes(cofounderInput)) {
      setCofounders([...cofounders, cofounderInput]);
      setCofounderInput("");
    }
  };

  const removeCofounder = (address: string) => {
    setCofounders(cofounders.filter((c) => c !== address));
  };

  const createCompany = async () => {
    setError("");
    if (!unityFlow) {
      setError("Network error");
      return;
    }
    if (!signer) {
        setError("Need connecting wallet");
        return;
      }
    if (!name || !image || !description) {
      setError("All fields are required");
      return;
    }
    if (balance && parseFloat(balance) < requiredTokens) {
        setError(`Insufficient token balance. You need at least ${requiredTokens} UF.`);
        return;
    }

    setIsLoading(true);
    try {
      const tx = await unityFlow.connect(signer).registerCompany(
        name, image, description, cofounders
      );
      await tx.wait();
      alert("Company registered successfully!");
      setName("");
      setImage("");
      setDescription("");
      setCofounders([]);
    } catch (error) {
      console.error("❌ Error registering company:", error);
      setError("Transaction failed. Check logs.");
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full flex flex-col justify-center items-center gap-3">
    <div className="p-3 bg-gray-100 rounded-full text-center shadow-md">
        <h3 className="text-base font-semibold">ℹ️ How It Works</h3>
        <p className="text-gray-700 text-sm mt-1">
          Creating a company on **UnityFlow** allows you to launch fundraising campaigns, attract investors, and participate in the governance of the platform.
        </p>
        <p className="text-gray-700 text-sm mt-2">
          **Requirements:** To register a company, you must hold at least **{requiredTokens} UF tokens**.
        </p>
        <p className={`mt-1 font-bold text-sm ${balance ? parseFloat(balance) : 0 >= requiredTokens ? "text-green-600" : "text-red-600"}`}>
            Your Balance: {balance ?? "0"} UF
        </p>
      </div>

      <div className="w-40 h-40 rounded-full flex items-center justify-center bg-gray-200">
        {image ? (
          <img src={image} alt="Company logo" className="w-40 h-40 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 animate-pulse bg-gray-400 rounded-full"></div>
        )}
      </div>

      <input
        type="text"
        placeholder="Company Name"
        className="border px-5 py-2 font-semibold rounded-full w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      
      <input
        type="text"
        placeholder="Image URL"
        className="border px-5 py-2 rounded-full w-full"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />

      <textarea
        placeholder="Company Description"
        className="border px-5 py-2 rounded-full w-full"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="w-full">
        <h4 className="ml-2 text-md font-medium">Cofounders</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Wallet address"
            className="border px-3 py-2 rounded-full flex-grow"
            value={cofounderInput}
            onChange={(e) => setCofounderInput(e.target.value)}
          />
          <button
            onClick={addCofounder}
            className="px-4 py-2 bg-green-500/85 hover:bg-green-500/95 hover:scale-[1.02] font-bold text-white rounded-full"
          >
            +
          </button>
        </div>

        <div className="mt-2 space-y-1">
          {cofounders.map((cofounder) => (
            <div key={cofounder} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-full">
              <span>{cofounder}</span>
              <button
                onClick={() => removeCofounder(cofounder)}
                className="text-red-500 font-semibold text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

       <div className="flex gap-4">
         <CustomButton onClick={() => router.back()} variant="secondary">
           Back
         </CustomButton>
         <CustomButton onClick={createCompany} variant="primary" disabled={isLoading}>
           {isLoading ? "Registering..." : "Registering Company"}
         </CustomButton>
       </div>
    </div>
  );
}

