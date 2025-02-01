"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { CROWDFUNDING_ADDRESS, TOKEN_ADDRESS, DAO_ADDRESS } from "@/config";
import { TokenUF, TokenUF__factory, GovernanceUF, GovernanceUF__factory, Crowdfunding, Crowdfunding__factory } from "@/typechain";

interface ContractsContextProps {
    provider: ethers.Provider | null;
    browserProvider: ethers.BrowserProvider | null;
    token: TokenUF | null;
    dao: GovernanceUF | null;
    crowdfunding: Crowdfunding | null;
    loadingWallet: boolean;
    connectWallet: () => Promise<void>; 
    signer: ethers.Signer | null;
  }

const ContractsContext = createContext<ContractsContextProps>({
    provider: null,
    browserProvider: null,
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
    dao: GovernanceUF | null;
  }

export const ContractsProvider = ({ children }: { children: React.ReactNode  }) => {
  const [contracts, setContracts] = useState<ContractsState>({ token: null, dao: null, crowdfunding: null });
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [browserProvider, setBrowserProvider] = useState<ethers.BrowserProvider | null>(null);
  const [loadingWallet, setLoadingWallet] = useState<boolean>(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    const initContracts = async () => {
      try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); 

        setProvider(provider);
        // setBrowserProvider(provider);
        
        const crowdfunding = Crowdfunding__factory.connect(CROWDFUNDING_ADDRESS, provider);
        const token = TokenUF__factory.connect(TOKEN_ADDRESS, provider);
        const dao = GovernanceUF__factory.connect(DAO_ADDRESS, provider);

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
    console.log("connectWallet work");
  
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
  
    try {
      setLoadingWallet(true);
      
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
  
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      if (accounts.length === 0) throw new Error("Користувач не підключив гаманець");
      
      const signer = await browserProvider.getSigner();

      console.log("Гаманець підключено:", await signer.getAddress());
  
      setBrowserProvider(browserProvider);
      setSigner(signer);

      // const accounts = await window.ethereum.request({
      //   method: "eth_requestAccounts",
      // });
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setLoadingWallet(false);
    }
  };

  return <ContractsContext.Provider value={ { provider, browserProvider, ...contracts, loadingWallet, connectWallet, signer} }>{children}</ContractsContext.Provider>;
};

export const useContractsContext = () => {
  return useContext(ContractsContext);
};