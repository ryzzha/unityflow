"use client"
import CustomButton from "@/components/custom-button";
import Search from "@/components/search-input";


export default function Home() {
  return (
    <div className="w-full h-screen flex flex-col gap-5">

    <div className="w-full h-auto flex justify-between items-center border-2 border-orange-600">
      <Search />
      <CustomButton onClick={() => alert("Primary!")} variant="primary">
        Create campaign
      </CustomButton>

    </div>

    <div className="w-full flex flex-col">
    <h3 className="text-lg font-bold">All compaigns ({"5"})</h3>

    <div className="w-full"></div>
    </div>
    </div>
  );
}
