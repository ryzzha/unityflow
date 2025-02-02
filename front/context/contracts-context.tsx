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

export const ContractsProvider = ({ children }: { children: React.ReactNode  }) => {
  const [state, setState] = useState({
    provider: null as ethers.Provider | null,
    browserProvider: null as ethers.BrowserProvider | null,
    crowdfunding: null as Crowdfunding | null,
    token: null as TokenUF | null,
    dao: null as GovernanceUF | null,
    loadingWallet: false,
    signer: null as ethers.Signer | null,
  });
  
  useEffect(() => {
    const initContracts = async () => {
      try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const crowdfunding = Crowdfunding__factory.connect(CROWDFUNDING_ADDRESS, provider);
        const token = TokenUF__factory.connect(TOKEN_ADDRESS, provider);
        const dao = GovernanceUF__factory.connect(DAO_ADDRESS, provider);
  
        setState({
          provider,
          browserProvider: null,
          crowdfunding,
          token,
          dao,
          loadingWallet: false,
          signer: null,
        });
  
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
      setState(prev => ({ ...prev, loadingWallet: true }));
      
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
  
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      if (accounts.length === 0) throw new Error("Користувач не підключив гаманець");
      
      const signer = await browserProvider.getSigner();

      console.log("Гаманець підключено:", await signer.getAddress());
  
      setState(prev => ({
        ...prev,
        browserProvider,
        signer,
        loadingWallet: false,
      }));

      // const accounts = await window.ethereum.request({
      //   method: "eth_requestAccounts",
      // });
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } 
  };

  return (
    <ContractsContext.Provider value={{ ...state, connectWallet }} >{children}</ContractsContext.Provider>
  )
};

export const useContractsContext = () => {
  return useContext(ContractsContext);
};