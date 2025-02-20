"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import CustomButton from "@/components/custom-button";
import { useContractsContext } from "@/context/contracts-context";
import { ethers, Contract } from "ethers";
import { Company__factory, Fundraising__factory } from "@/typechain";
import CategoryIcon from "@/components/icons/category-icon";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Icon } from "@/components/icon"
import { unityFlowUser } from "@/assets";
import { MoneyIcon, UsersIcon, UserMinus, UserPlus } from "@/components/icons";
import FundCard from "@/entities/fund/ui/fund-card";
import { useCompany } from "@/entities/company/api/get-company";
import { useAddCofounder, useRemoveCofounder } from "@/entities/company/api/add-cofounder";
import { useFundraisers } from "@/entities/company/api/get-company-funds";

const PAGE_SIZE = 4;

const TABS = [
  { id: "overview", label: "Overview", description: "This is the company's statistics page, showing general information about funds and operations." },
  { id: "actions", label: "Actions", description: "This section logs the company’s activity history and transactions." },
  { id: "funds", label: "Funds", description: "Here, you can donate to the company's fundraising campaigns. The company pays a commission from each fundraiser at the end." },
  { id: "investment", label: "Investment", description: "Investors contribute funds that the founder cannot freely spend. Depending on their stake, they receive a percentage of commissions from fundraisers." },
];

interface IFund {
    id: bigint;
    address: string;
    company: string;
    title: string;
    image: string;
    category: string;
    goalUSD: bigint;
    deadline: bigint;
    status: "active" | "success" | "failed";
  }

export default function CompanyPage() {
  const { provider, signer } = useContractsContext();
  // const [funds, setFunds] = useState<IFund[] | null>(null);
  const [signerAddress, setSignerAddress] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [dividends, setDividends] = useState({ eth: "0", uf: "0" });
  const [showInvestors, setShowInvestors] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({ ethToUsd: 0, ufToUsd: 0 });
  const [newCofounder, setNewCofounder] = useState("");

  const { address } = useParams();
  const { data: company, isLoading: isCompanyLoading } = useCompany(address as string);
  const { data: funds, isLoading: isFundLoading } = useFundraisers(company?.fundraisers || []);
  const { mutate: addCofounder, isPending: isAdding } = useAddCofounder(address as string);
  const { mutate: removeCofounder } = useRemoveCofounder(address as string);

  
  const router = useRouter();

  const fetchDividends = async () => {
    if (!provider || !signerAddress || !address) return;

    try {
      const companyContract = Company__factory.connect(address as string, provider);
      const [ethDividends, ufDividends] = await companyContract.getInvestorDividends(signerAddress);

      setDividends({
        eth: ethers.formatEther(ethDividends ?? 0),
        uf: ethers.formatEther(ufDividends ?? 0),
      });
    } catch (error) {
      console.error("Error fetching dividends:", error);
    } finally {
    }
  };


  const handleAddCofounder = async () => {
    if (!signer || !company) return;
    addCofounder(newCofounder, {
      onSuccess: () => setNewCofounder(""), 
    });
  };

  const handleRemoveCofounder = async (cofounderAddress: string) => {
    if (!signer || !company) return;
    removeCofounder(cofounderAddress);
  };

  if (isCompanyLoading) return <div className="text-center text-lg">Завантаження...</div>;
  if (!company) return <div className="text-center text-lg">Компанія не знайдена</div>;

  const treasuryUSD = convertToUSD(company.totalFundsETH, company.totalFundsUF, exchangeRates.ethToUsd, exchangeRates.ufToUsd);
  const investmentsUSD = convertToUSD(company.totalInvestmentsETH, company.totalInvestmentsUF, exchangeRates.ethToUsd, exchangeRates.ufToUsd);

  return (
    <div className="w-full mx-auto p-7 bg-white shadow-lg rounded-xl flex flex-col gap-3">
        <div className="w-full flex justify-between items-center bg-gray-50 p-3 rounded-xl">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
                <Image src={company.image} alt={company.name} width={85} height={85} className="rounded-lg" />
                <div className="flex-1">
                <h1 className="text-2xl font-bold">{company.name}</h1>
                <p className="text-gray-600">{company.description}</p>
                <div className="flex items-center gap-2 mt-1">
                    <CategoryIcon />
                    <p className="text-sm text-gray-500 font-medium">{company.category}</p>
                </div>
                </div>
            </div>
            <div className={`mt-2 px-3 py-1 inline-block rounded-full text-sm text-white font-semibold ${company.isActive ? "bg-green-400/85" : "bg-red-400/85"}`}>
                {company.isActive ? "Active" : "Closed"}
            </div>
        </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
        <p><strong>Contract address:</strong> {company.address}</p>
        <p><strong>Founder:</strong> {company.founder}</p>
      </div>

    <div className="relative border-b flex space-x-4 mt-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`relative text-sm font-medium py-2 px-4 ${activeTab === tab.id ? "text-green-600" : "text-gray-500"}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                className="absolute left-0 bottom-0 w-full h-1 bg-green-500/85 rounded-t-md"
                layoutId="underline"
              />
            )}
          </button>
        ))}
      </div>

      <div className="mt-1 p-4 bg-gray-100 rounded-lg mb-5">
        <h3 className="text-lg font-semibold">How it works?</h3>
        <p className="text-sm text-gray-600 mt-2">{TABS.find(tab => tab.id == activeTab)?.description}</p>
      </div>

       {/* Вміст вкладок */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 gap-7 text-sm text-gray-700">
            {/* 🔹 Баланс компанії */}
            <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                <div className="w-full flex gap-1 items-center mb-3"><MoneyIcon /> <h3 className="text-lg font-semibold">Company balance</h3></div>
                <div className="flex flex-col gap-2">
                  <p><strong>Treasury:</strong></p>
                  <p className="text-lg font-bold flex gap-1 items-center">
                      <Icon name="eth" /> {company.totalFundsETH} ETH / <Icon name="uf" /> {company.totalFundsUF} UF
                      <span className="text-gray-500 text-sm"> (~${treasuryUSD})</span>
                  </p>
                  <p><strong>Investments:</strong></p>
                  <p className="text-lg font-bold flex gap-1 items-center">
                      <Icon name="eth" />  {company.totalInvestmentsETH} ETH / <Icon name="uf" /> {company.totalInvestmentsUF} UF
                      <span className="text-gray-500 text-sm"> (~${investmentsUSD})</span>
                  </p>
                </div>
            </div>

            {/* 🔹 Співзасновники */}
            <div className="w-full flex flex-col gap-1">
              <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
              <div className="w-full flex gap-1 items-center mb-3"><UsersIcon /> <h3 className="text-lg font-semibold">Cofounders</h3></div>
                {company.cofounders.length > 0 ? (
                  <ul className="space-y-3">
                  {company.cofounders.map((cofounder, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <Image
                        src={unityFlowUser} 
                        alt={"сofounder"}
                        width={35}
                        height={35}
                        className="rounded-full border border-gray-300"
                      />
                      <span className="text-base font-semibold text-gray-500/95">{cofounder}</span>
                      {signerAddress === company.founder && (
                        <button
                          onClick={() => handleRemoveCofounder(cofounder)}
                          className="bg-red-400/85 text-white px-2 py-1 rounded-md hover:bg-red-500/85 text-xs ml-auto"
                        >
                         <UserMinus />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                ) : (
                  <p className="text-gray-500">Have not any cofounders.</p>
                )}
              </div>
              <div>
                {signerAddress === company.founder && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newCofounder}
                      onChange={(e) => setNewCofounder(e.target.value)}
                      placeholder="Enter cofounder address"
                      className="flex-1 p-2 border rounded-md"
                    />
                    <button
                      onClick={handleAddCofounder}
                      className="bg-green-400/85 text-white px-2 py-1 rounded-md hover:bg-green-500/85"
                      disabled={isAdding || !newCofounder}
                    >
                      {isAdding ? "Adding..." : <UserPlus />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "funds" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">📢 Company fundraisings</h2>
              {signerAddress === company.founder && (
                <CustomButton
                  variant="primary"
                  onClick={() => router.push(`/fundraisers/create?company=${company.address}`)}
                >
                  + create
                </CustomButton>
              )}
            </div>

            {/* 🔹 Лістинг зборів з пагінацією */}
            {funds ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {funds.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).reverse().map((fund, index) => (
                <FundCard key={fund.id} fund={fund} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Зборів ще немає.</p>
          )}
            {company.fundraisers.length > PAGE_SIZE && (
            <div className="flex justify-center mt-6">
              <button
                className={`p-2 mx-1 rounded-md text-sm font-semibold ${
                  currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ◀
              </button>

              {Array.from({ length: Math.ceil(company.fundraisers.length / PAGE_SIZE) }).map((_, i) => (
                <button
                  key={i}
                  className={`px-4 py-2 mx-1 rounded-md text-sm font-semibold ${
                    currentPage === i + 1 ? "bg-green-500/85 text-white" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className={`p-2 mx-1 rounded-md text-sm font-semibold ${
                  currentPage === Math.ceil(company.fundraisers.length / PAGE_SIZE)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(company.fundraisers.length / PAGE_SIZE)))}
                disabled={currentPage === Math.ceil(company.fundraisers.length / PAGE_SIZE)}
              >
                ▶
              </button>
            </div>
          )}
          </>
        )}

    

        {activeTab === "investment" && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Інвестиції</h2>
            {/* TODO: Додати інформацію про дивіденди та інвесторів */}
          </div>
        )}

        {activeTab === "actions" && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Історія активності</h2>
            {/* TODO: Додати лог активності компанії */}
          </div>
        )}
    </div>
  );
}

async function fetchExchangeRates() {
  try {
    // const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum,uf-token&vs_currencies=usd");
    // const data = await response.json();
    return {
      // ethToUsd: data.ethereum?.usd || 0,
      ethToUsd: 2750,
      // ufToUsd: data["uf-token"]?.usd || 0,
      ufToUsd: 3,
    };
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return { ethToUsd: 0, ufToUsd: 0 };
  }
}

function convertToUSD(ethAmount: string, ufAmount: string, ethRate: number, ufRate: number) {
  const ethInUSD = parseFloat(ethAmount) * ethRate;
  const ufInUSD = parseFloat(ufAmount) * ufRate;
  return (ethInUSD + ufInUSD).toFixed(1);
}

