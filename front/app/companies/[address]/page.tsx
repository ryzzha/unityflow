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

const PAGE_SIZE = 5;

const TABS = [
    { id: "overview", label: "Огляд" },
    { id: "funds", label: "Збори" },
    { id: "investment", label: "Інвестиції" },
    { id: "actions", label: "Дії" },
  ];

interface ICompany {
  id: bigint;
  address: string;
  name: string;
  image: string;
  description: string;
  category: string;
  founder: string;
  cofounders: string[];
  totalFundsETH: string;
  totalFundsUF: string;
  totalInvestmentsETH: string;
  totalInvestmentsUF: string;
  fundraisers: string[];
  investors: string[];
  isActive: boolean;
}

interface IFund {
    id: bigint;
    address: string;
    title: string;
    image: string;
    category: string;
    goalUSD: bigint;
    deadline: bigint;
    status: string;
  }

export default function CompanyPage() {
  const { provider, signer } = useContractsContext();
  const [company, setCompany] = useState<ICompany | null>(null);
  const [funds, setFunds] = useState<IFund[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [dividends, setDividends] = useState({ eth: "0", uf: "0" });
  const [showInvestors, setShowInvestors] = useState(false);

  const { address } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (!provider || !address) return;

    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        const companyContract = Company__factory.connect(address.toString(), provider);
        
        const {
          companyId,
          companyAddress,
          name,
          image,
          description,
          category,
          founder,
          cofounders,
          totalFundsETH,
          totalFundsUF,
          totalInvestmentsETH,
          totalInvestmentsUF,
          fundraisers,
          investors,
          isActive
        } = await companyContract.getCompanyDetails();

        setCompany({
          id: companyId,
          address: companyAddress,
          name,
          image,
          description,
          category,
          founder,
          cofounders,
          totalFundsETH: ethers.formatEther(totalFundsETH),
          totalFundsUF: ethers.formatEther(totalFundsUF),
          totalInvestmentsETH: ethers.formatEther(totalInvestmentsETH),
          totalInvestmentsUF: ethers.formatEther(totalInvestmentsUF),
          fundraisers,
          investors,
          isActive,
        });

        const fundsData: IFund[] = await Promise.all(
            fundraisers.map(async (fundraiserAddrs) => {
                const fundraiser = Fundraising__factory.connect(fundraiserAddrs, provider);
                const [id, address, title, image, category, goalUSD, deadline, status] = await fundraiser.getInfo();
                return {
                    id,
                    address,
                    title,
                    image,
                    category,
                    goalUSD,
                    deadline,
                    status,
                  };
            })
        )

        setFunds(fundsData);

        if (signer) {
            const [ethDividends, ufDividends] = await companyContract.getInvestorDividends(signer.getAddress());
            setDividends({
              eth: ethers.formatEther(ethDividends),
              uf: ethers.formatEther(ufDividends),
            });
        };

      } catch (error) {
        console.error("❌ Помилка отримання даних компанії:", error);
      }
      setIsLoading(false);
    };

    fetchCompany();
  }, [provider, signer, address]);

  if (isLoading) return <div className="text-center text-lg">Завантаження...</div>;
  if (!company) return <div className="text-center text-lg">Компанія не знайдена</div>;

  return (
    <div className="w-full mx-auto p-7 bg-white shadow-lg rounded-xl flex flex-col gap-6">
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
        <p><strong>Funds:</strong> {company.totalFundsETH} ETH / {company.totalFundsUF} UF</p>
        <p><strong>Investments:</strong> {company.totalInvestmentsETH} ETH / {company.totalInvestmentsUF} UF</p>
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

      <div className="mt-1 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold">Як працює система?</h3>
        <p className="text-sm text-gray-600 mt-2">
          Інвестиції дозволяють отримати частку компанії, а донати підтримують її розвиток без повернення коштів. 
          Використовуйте збір коштів для фінансування різних ініціатив.
        </p>
      </div>

       {/* Вміст вкладок */}
       <div className="mt-4">
        {activeTab === "overview" && (
            <div className="grid grid-cols-2 gap-6 text-sm text-gray-700">
            {/* 🔹 Баланс компанії */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3">💰 Баланс компанії</h3>
                <div className="flex flex-col gap-2">
                <p><strong>Загальні кошти:</strong></p>
                <p className="text-xl font-bold text-green-600">
                    {company.totalFundsETH} ETH / {company.totalFundsUF} UF
                </p>
                <p><strong>Зібрані інвестиції:</strong></p>
                <p className="text-xl font-bold text-blue-600">
                    {company.totalInvestmentsETH} ETH / {company.totalInvestmentsUF} UF
                </p>
                </div>
            </div>

            {/* 🔹 Співзасновники */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3">👥 Співзасновники</h3>
                {company.cofounders.length > 0 ? (
                <ul className="list-disc pl-4 text-gray-600">
                    {company.cofounders.map((cofounder, index) => (
                    <li key={index} className="text-sm">
                        {cofounder}
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-gray-500">Співзасновників поки немає.</p>
                )}
            </div>
            </div>
        )}
        </div>

        <div className="mt-4">
    {activeTab === "funds" && (
        <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">📢 Збори компанії</h2>
            {signer && signer.getAddress().toString() === company.founder && (
            <CustomButton variant="primary" onClick={() => router.push(`/fundraisers/create?company=${company.address}`)}>
                ➕ Створити збір
            </CustomButton>
            )}
        </div>

        {/* 🔹 Лістинг зборів з пагінацією */}
        {funds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {funds.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((fundraiser, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="text-md font-semibold mb-1">🏆 {fundraiser.title}</h3>
                <p className="text-sm text-gray-600">Ціль: <span className="font-semibold">{fundraiser.goalUSD} USD</span></p>
                <p className="text-sm text-gray-600">
                    Дедлайн: <span className="font-semibold">{format(new Date(fundraiser.deadline * 1000), "dd.MM.yyyy")}</span>
                </p>
                <p className={`text-sm font-semibold ${fundraiser.isActive ? "text-green-600" : "text-red-600"}`}>
                    {fundraiser.isActive ? "Активний" : "Завершено"}
                </p>
                <CustomButton variant="secondary" onClick={() => router.push(`/fundraisers/${fundraiser.address}`)}>
                    🔍 Переглянути
                </CustomButton>
                </div>
            ))}
            </div>
        ) : (
            <p className="text-gray-500 text-sm">Зборів ще немає.</p>
        )}

        {/* 🔹 Пагінація */}
        {company.fundraisers.length > PAGE_SIZE && (
            <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: Math.ceil(company.fundraisers.length / PAGE_SIZE) }).map((_, i) => (
                <button
                key={i}
                className={`px-3 py-1 rounded-md text-sm font-semibold ${currentPage === i + 1 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}
                onClick={() => setCurrentPage(i + 1)}
                >
                {i + 1}
                </button>
            ))}
            </div>
        )}
        </div>
    )}
    </div>

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
