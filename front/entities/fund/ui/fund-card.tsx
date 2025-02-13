"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatEther } from "ethers";
import CustomButton from "@/components/custom-button";
import CategoryIcon from "@/components/icons/category-icon";
import ArrowRightFilled from "@/components/icons/arrow-right-filled";

interface FundCardProps {
  fund: {
    id: bigint;
    company: string;
    title: string;
    image: string;
    category: string;
    goalUSD: bigint;
    deadline: bigint;
    isActive: boolean;
  };
}

export default function FundCard({ fund }: FundCardProps) {
  const { id, company, title, image, category, goalUSD, deadline, isActive } = fund;
  const router = useRouter();

  return (
    <div 
      className="sm:max-w-[320px] px-5 py-3 w-full rounded-xl bg-white shadow-lg hover:shadow-xl transition duration-300 cursor-pointer border border-gray-200"
      onClick={() => router.push(`/funds/${id}`)}
    >
      {/* <Image 
        src={image} 
        alt={title} 
        width={320} 
        height={180} 
        className="w-full h-[180px] object-cover rounded-t-[15px]"
      /> */}
      <Image 
        src={"https://picsum.photos/200"} 
        alt={title} 
        width={200} 
        height={120} 
        className="w-full h-[140px] object-cover mt-1 rounded-lg"
      />

      <div className="flex flex-col p-2">
        <div className="flex items-center mr-auto gap-1 px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-600">
            <CategoryIcon/>
            <span className="text-xs">{category}</span>
        </div>

        <h3 className="mt-2 text-base font-semibold text-gray-800 truncate">{title}</h3>
        <p className="text-sm text-gray-600 mt-1 truncate">By <span className="font-medium text-gray-900">{company}</span></p>

        <div className="flex justify-between items-center mt-2">
          <div>
            <p className="text-xs text-gray-500">Goal</p>
            <p className="text-sm font-semibold text-gray-800">${goalUSD}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Deadline</p>
            <p className="text-sm font-semibold text-gray-800">{new Date(Number(deadline) * 1000).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <span className={`text-xs px-2 py-1 rounded-md ${isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {isActive ? "Active" : "Closed"}
          </span>
          <CustomButton 
            variant="secondary"
            size="small" 
            disabled={!isActive} 
            onClick={() => router.push(`/funds/${id}`)}
            className="flex gap-1"
            >
              <span>View Details</span> <ArrowRightFilled /> 
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
