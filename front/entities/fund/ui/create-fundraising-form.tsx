"use client";

import { useState } from "react";
import CustomButton from "@/components/custom-button";

export default function CreateFundraisingForm() {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");

  const createFundraising = async () => {
    console.log("Creating fundraising:", title, goal, deadline);
    // Логіка відправки в блокчейн
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Start a Fundraising</h3>
      <input
        type="text"
        placeholder="Title"
        className="border p-3 rounded-md w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Goal (USD)"
        className="border p-3 rounded-md w-full"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />
      <input
        type="date"
        className="border p-3 rounded-md w-full"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <CustomButton onClick={createFundraising} variant="primary">
        Start Fundraising
      </CustomButton>
    </div>
  );
}
