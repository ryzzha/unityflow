"use client";

import CustomButton from "@/components/custom-button";
import { useState } from "react";
import { parseEther } from "ethers";
import { useContractsContext } from "@/context/contracts-context";
import { useRouter } from "next/navigation";
import { FundCategory } from "@/entities/campaign/model/types";
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
    <div className="w-full h-screen flex flex-col gap-3 py-5 items-center">
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

//
//
//


// export default function CreateFund() {
//   const { provider, signer } = useContractsContext();
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [category, setCategory] = useState<FundCategory>("All");
//   const [goal, setGoal] = useState("");
//   const [deadline, setDeadline] = useState("");
//   const [image, setImage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const router = useRouter();

//   const resetForm = () => {
//     setTitle("");
//     setDescription("");
//     setCategory("All");
//     setGoal("");
//     setDeadline("");
//     setImage("");
//   };

//   const createCampaign = async () => {
//     setError("");
//     if (!provider) {
//       setError("No provider available");
//       return;
//     }
//     if (!signer) {
//       setError("No signer detected. Connect wallet.");
//       return;
//     }
    
//     setIsLoading(true);
//     try {
//       const tx = await crowdfunding.connect(signer).createCampaign(
//         title,
//         description,
//         category,
//         parseEther(goal.toString()),
//         Math.floor(new Date(deadline).getTime() / 1000),
//         image
//       );
//       await tx.wait();
//       alert("Campaign created successfully!");
//       resetForm();
//     } catch (error) {
//       console.error("❌ Error creating campaign:", error);
//       setError("Transaction failed. Check logs.");
//     }
//     setIsLoading(false); 
//   };

//   return (
//     <div className="w-full h-screen flex flex-col gap-5 py-5 items-center">
//       <h2 className="text-2xl font-bold">Create a New Campaign</h2>
      
//       <div className="w-40 h-40 rounded-full flex items-center justify-center bg-gray-200">
//         {image ? (
//           <img src={image} alt="Campaign preview" className="w-40 h-40 rounded-full object-cover" />
//         ) : (
//           <div className="w-20 h-20 animate-pulse bg-gray-400 rounded-full"></div>
//         )}
//       </div>
      
//       <input
//         type="text"
//         placeholder="Title"
//         className="border p-3 rounded-full w-full"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//       />
//       <textarea
//         placeholder="Description"
//         className="border p-3 rounded-full w-full"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//       />
      
//       <div className="flex gap-2 flex-wrap">
//         {(["All", "Startups", "Art", "Fun", "Education", "Health", "Environment", "Social", "Animals", "Personal"] as FundCategory[]).map(cat => (
//           <button
//             key={cat}
//             className={`px-4 py-2 border rounded-full transition-all ${category === cat ? 'bg-green-300 text-white' : 'bg-gray-200 text-black'}`}
//             onClick={() => setCategory(cat)}
//           >
//             {cat}
//           </button>
//         ))}
//       </div>
      
//       <input
//         type="text"
//         placeholder="Goal amount (ETH)"
//         className="border p-3 rounded-full w-full"
//         value={goal}
//         onChange={(e) => {
//             const value = e.target.value;
        
//             // Дозволяємо лише цифри та одну крапку
//             if (/^\d*\.?\d*$/.test(value) || value === "") {
//               setGoal(value); // Зберігаємо як рядок
//             }
//           }}
//           onBlur={() => {
//             // При втраті фокусу, якщо є число, форматувати його правильно
//             if (goal !== "" && !isNaN(parseFloat(goal))) {
//               setGoal(parseFloat(goal).toString()); // Видаляє зайві нулі (5.500 → 5.5)
//             }
//           }}
//           inputMode="decimal"
//       />
//       <input
//         type="date"
//         className="border p-3 rounded-full w-full"
//         value={deadline}
//         onChange={(e) => setDeadline(e.target.value)}
//       />
//       <input
//         type="text"
//         placeholder="Image URL"
//         className="border p-3 rounded-full w-full"
//         value={image}
//         onChange={(e) => setImage(e.target.value)}
//       />
      
//       <div className="flex gap-4">
//         <CustomButton onClick={() => router.back()} variant="secondary">
//           Back
//         </CustomButton>
//         <CustomButton onClick={createCampaign} variant="primary" disabled={isLoading}>
//           {isLoading ? "Creating..." : "Create Campaign"}
//         </CustomButton>
//       </div>
      
//       {error && <p className="text-red-500 text-sm">{error}</p>}
//     </div>
//   );
// }