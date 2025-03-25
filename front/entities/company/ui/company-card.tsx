"use client";

import ArrowRightFilled from "@/components/icons/arrow-right-filled";
import CategoryIcon from "@/components/icons/category-icon";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/custom-button";

interface CompanyCardProps {
  company: {
    id: bigint;
    address: string;
    name: string;
    image: string;
    description: string;
    category: string;
    founder: string;
    isActive: boolean;
  };
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const { address, name, image, description, category, founder, isActive } = company;

  const router = useRouter();

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div
      className={`relative rounded-xl shadow-md p-5 flex flex-col justify-center items-center w-full transition-transform duration-300 hover:shadow-lg hover:scale-[1.01] ${
        isActive ? "bg-white" : "bg-gray-200"
      }`}
    >
      {!isActive && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
          Closed
        </div>
      )}

      <div className="w-full flex flex-col items-center gap-3 overflow-hidden ">
        <Image 
          src={image} 
          alt={name} 
          width={100} 
          height={100} 
          className="w-full h-[125px] object-cover mt-1 rounded-lg"
        />

        <div className="w-full flex flex-col justify-center items-start flex-1">
          <h4 className="text-base font-semibold text-gray-900 truncate">{name}</h4>

          <p className="text-gray-600 text-sm line-clamp-2 break-words overflow-hidden text-ellipsis">
            {truncateText(description, 50)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <CategoryIcon />
            <p className="text-sm text-gray-500 font-medium">{category}</p>
          </div>

          <span className="text-xs text-gray-500 italic mt-1">
            Founder:{" "}
            <span className="font-medium text-gray-900">
              {founder.slice(0, 6)}...{founder.slice(-4)}
            </span>
          </span>

          <CustomButton 
            variant="secondary"
            size="small" 
            disabled={!isActive} 
            className="flex gap-1 mt-2"
            onClick={() => router.push(`companies/${address}`)}
            >
              <span>View Details</span> <ArrowRightFilled /> 
          </CustomButton>
        </div>
      </div>

    </div>
  );
}
