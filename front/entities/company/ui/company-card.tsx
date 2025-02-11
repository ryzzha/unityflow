"use client";

import ArrowRight from "@/components/icons/arrow-right";
import Image from "next/image";

interface CompanyCardProps {
  company: {
    id: bigint;
    name: string;
    image: string;
    description: string;
    founder: string;
  };
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const { name, image, description, founder } = company;

  return (
    <div className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between items-center w-full transition-transform duration-300 hover:shadow-lg hover:scale-[1.01]">
      <div className="w-full flex justify-between gap-3">
        <Image
            src={image}
            alt={name}
            width={85}
            height={85}
            className="rounded-xl object-cover border border-gray-300 shadow-sm"
        />
        <div>
            <h4 className="text-lg font-semibold text-gray-900">{name}</h4>
            <p className="text-gray-500 text-sm line-clamp-2">{description}</p>
            <span className="text-sm text-gray-600 italic">
            Founder: <span className="font-medium text-gray-900">{founder.slice(0, 6)}...{founder.slice(-4)}</span>
            </span>
        </div>
      </div>
      <button className="flex gap-1 mt-3 mx-auto px-3 py-1 bg-gray-400/85 text-white rounded-md text-sm font-medium hover:bg-gray-500 transition">
          <span>View Details</span> <ArrowRight />
      </button>
    </div>
  );
}
