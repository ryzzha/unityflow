"use client"

import { IGlobalStatistics } from "@/shared/interfaces";
import { useState, useEffect } from "react";
import { Icon } from "@/components/icon"
import { CloseIcon, RocketIcon, StatisticsIcon, VoteIcon } from "@/components/icons";

interface GlobalStatsProps {
    stats: IGlobalStatistics | null;
    ethToUsd?: number;
    ufToUsd?: number;
  }
  
  export const GlobalStatistics = ({ stats, ethToUsd = 3000, ufToUsd = 5 }: GlobalStatsProps) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      if (stats) {
        setIsLoading(false);
      }
    }, [stats]);

    if (isLoading) return <SkeletonLoader />;

    if (!stats) return null;

    console.log(stats)

    const totalDonationsUSD =
      (parseFloat(stats.totalDonationsETH ?? "0") * ethToUsd) +
      (parseFloat(stats.totalDonationsUF ?? "0") * ufToUsd);
  
    const totalInvestmentsUSD =
      (parseFloat(stats.totalInvestmentsETH.toString() ?? "0") * ethToUsd) +
      (parseFloat(stats.totalInvestmentsUF.toString() ?? "0") * ufToUsd);
  
    const platformBalanceUSD =
      (parseFloat(stats.platformBalanceETH.toString() ?? "0") * ethToUsd) +
      (parseFloat(stats.platformBalanceUF.toString() ?? "0") * ufToUsd);
  
    return (
      <div className="mt-6 p-6 z-50 bg-gradient-to-r from-gray-50/85 to-gray-100/55 shadow-md rounded-2xl w-full mx-auto">
        <div className="w-full flex gap-2 justify-center items-center mb-5"><StatisticsIcon /> <h2 className="text-xl font-semibold text-center  text-gray-700">Platform Statistics</h2></div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
  
          {/* 🏢 Загальна кількість компаній */}
          <StatBox title="Total Companies" color="bg-green-200/40" hover="hover:bg-green-300/40">
            <p className="text-lg font-semibold text-gray-800">{stats.companyCount.toString()}</p>
            <div className="text-sm text-gray-600 mt-1">
              <p className="flex gap-1"><RocketIcon /> <span>Active: {stats.activeCompanies ?? "0"}</span></p>
              <p className="flex gap-1"><CloseIcon  /> <span>Closed: {stats.closedCompanies ?? "0"}</span></p>
            </div>
          </StatBox>
  
          {/* 💰 Total Donations */}
          <StatBox title="Total Donations" color="bg-blue-200/40" hover="hover:bg-blue-300/40">
            <p className="text-lg font-semibold text-gray-800">{totalDonationsUSD.toFixed(1)} $</p>
            <div className=" flex flex-col gap-1 text-sm text-gray-600 mt-1">
              <p className="flex gap-1"><Icon name="eth" /> <span>{stats.totalDonationsETH ?? "0"} ETH</span></p>
              <p className="flex gap-1"><Icon name="uf" /> <span>{stats.totalDonationsUF ?? "0"} UF</span></p>
            </div>
          </StatBox>
  
          {/* 📈 Total Investments */}
          <StatBox title="Total Investments" color="bg-green-200/40" hover="hover:bg-green-300/40">
            <p className="text-lg font-semibold text-gray-800">{totalInvestmentsUSD.toFixed(1)} $</p>
            <div className="flex flex-col  gap-1 text-sm text-gray-600 mt-1">
              <p className="flex gap-1"><Icon name="eth" /> <span>{stats.totalInvestmentsETH ?? "0"} ETH</span></p>
              <p className="flex gap-1"><Icon name="uf" /> <span>{stats.totalInvestmentsUF ?? "0"} UF</span></p>
            </div>
          </StatBox>
  
          {/* 🏦 Platform Balance */}
          <StatBox title="Platform Balance" color="bg-gray-200/40" hover="hover:bg-gray-300/40">
            <p className="text-lg font-semibold text-gray-800">{platformBalanceUSD.toFixed(1)} $</p>
            <div className="flex flex-col gap-1 text-sm text-gray-600 mt-1">
              <p className="flex gap-1"><Icon name="eth" /> <span>{stats.platformBalanceETH ?? "0"} ETH</span></p>
              <p className="flex gap-1"><Icon name="uf" /> <span>{stats.platformBalanceUF ?? "0"} UF</span></p>
            </div>
          </StatBox>
  
          {/* 🏛 DAO Governance */}
          <StatBox title="DAO Governance" color="bg-yellow-200/40" hover="hover:bg-yellow-200/65">
            <p className="text-lg font-semibold text-gray-800">{stats.proposalCount.toString()} proposals</p>
            <div className="text-xs text-gray-600 mt-1">
            <p className="flex items-center gap-1"><VoteIcon /> <span>Total Votes: {stats.totalVotes.toString()}</span></p>
            </div>
          </StatBox>
  
        </div>
      </div>
    );
  };
  
  interface StatBoxProps {
    title: string;
    value?: string | number;
    color: string;
    hover: string;
    highlight?: string;
    children?: React.ReactNode;
  }
  
  // 🔹 Оновлений `StatBox`
  const StatBox: React.FC<StatBoxProps> = ({ title, value, color, hover, highlight = "", children }) => (
    <div className={`p-4 rounded-xl ${color} ${hover} text-center shadow-sm transition-transform duration-200 `}>
      <h3 className="text-base font-medium text-gray-600">{title}</h3>
      {value !== undefined ? (
        <p className={`text-lg font-semibold text-gray-800 mt-1 ${highlight}`}>{value}</p>
      ) : (
        <div className="w-full flex flex-col justify-center items-center">{children}</div> 
      )}
    </div>
  );

  const SkeletonLoader = () => {
    return (
      <div className="animate-pulse mt-6 p-6 bg-gray-100/85 shadow-md rounded-2xl w-full mx-auto">
        <div className="w-full flex gap-2 justify-center items-center mb-5"><StatisticsIcon /> <h2 className="text-xl font-semibold text-center text-gray-400">Loading Platform Statistics...</h2></div>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-5 rounded-xl bg-gray-300/40 h-32 shadow-sm"></div>
          ))}
        </div>
      </div>
    );
  };
  


