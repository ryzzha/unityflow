"use client";

import ArrowRightFilled from "@/components/icons/arrow-right-filled";
import CategoryIcon from "@/components/icons/category-icon";
import Image from "next/image";

interface CompanyCardProps {
  company: {
    id: bigint;
    name: string;
    image: string;
    description: string;
    category: string;
    founder: string;
    isActive: boolean;
  };
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const { name, image, description, category, founder, isActive } = company;

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div
      className={`relative rounded-xl shadow-md p-3 flex flex-col justify-center items-center w-full transition-transform duration-300 hover:shadow-lg hover:scale-[1.01] ${
        isActive ? "bg-white" : "bg-gray-200"
      }`}
    >
      {/* Бейдж "Closed", якщо компанія неактивна */}
      {!isActive && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
          Closed
        </div>
      )}

      <div className="w-full flex items-center gap-3 overflow-hidden ">
        <Image
          src={image}
          alt={name}
          width={100}
          height={100}
          className="rounded-full border border-gray-300 shadow-sm"
        />

        <div className="flex flex-col items-start flex-1">
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

          <button
            className={`flex justify-start gap-2 mt-3 px-3 py-1 rounded-md text-sm font-medium transition ${
              isActive ? "bg-gray-400 hover:bg-gray-500 text-white" : "bg-gray-500 text-gray-300 cursor-not-allowed"
            }`}
            disabled={!isActive}
          >
            <span>View Details</span> <ArrowRightFilled />
          </button>
        </div>
      </div>

    </div>
  );
}
