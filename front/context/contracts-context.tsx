"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { CROWDFUNDING_ADDRESS, TOKEN_ADDRESS, DAO_ADDRESS } from "@/config";
import { TokenUF, TokenUF__factory, Governance, Governance__factory, Crowdfunding, Crowdfunding__factory } from "@/typechain";

interface ContractsContextProps {
    token: TokenUF | null;
    dao: Governance | null;
    crowdfunding: Crowdfunding | null;
    loadingWallet: boolean;
    connectWallet: () => Promise<void>; 
    signer: ethers.Signer | null;
  }

const ContractsContext = createContext<ContractsContextProps>({
    token: null,
    dao: null,
    crowdfunding: null,
    loadingWallet: false,
    connectWallet: async () => {},
    signer: null
});

interface ContractsState {
    crowdfunding: Crowdfunding | null;
    token: TokenUF | null;
    dao: Governance | null;
  }

export const ContractsProvider = ({ children }: { children: React.ReactNode  }) => {
  const [contracts, setContracts] = useState<ContractsState>({ token: null, dao: null, crowdfunding: null });
  const [browserProvider, setBrowserProvider] = useState<ethers.BrowserProvider | null>(null);
  const [loadingWallet, setLoadingWallet] = useState<boolean>(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    const initContracts = async () => {
      try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); 
        
        const crowdfunding = Crowdfunding__factory.connect(CROWDFUNDING_ADDRESS, provider);
        const token = TokenUF__factory.connect(TOKEN_ADDRESS, provider);
        const dao = Governance__factory.connect(DAO_ADDRESS, provider);

        setContracts((prev) => ({
          ...prev,
          token,
          dao,
          crowdfunding
        }));

        console.log("Контракти ініціалізовано:", { crowdfunding, token, dao });

      } catch (error) {
        console.error("Помилка ініціалізації контрактів:", error);
      }
    };

    initContracts();
  }, []);

  const connectWallet = async () => {
    console.log("connectWallet work")
    try {
      setLoadingWallet(true);
      if (window.ethereum) {
        const browserProvider = new ethers.BrowserProvider( window.ethereum);
        console.log("connectWallet work 2")
        const accounts = await browserProvider.send("eth_requestAccounts", []);
    if (accounts.length === 0) throw new Error("Користувач не підключив гаманець");
        const signer = await browserProvider.getSigner();

        setBrowserProvider(browserProvider);
        setSigner(signer);

        // // Уникаємо дублювання слухачів
        // if (!window.ethereum.on.listeners("accountsChanged").length) {
        //   window.ethereum.on("accountsChanged", (accounts: string[]) => {
        //     setAccount(accounts[0] || null);
        //     setSigner(null);
        //   });
        // }
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setLoadingWallet(false);
    }
  };

  return <ContractsContext.Provider value={ {...contracts, loadingWallet, connectWallet, signer} }>{children}</ContractsContext.Provider>;
};

export const useContractsContext = () => {
  return useContext(ContractsContext);
};