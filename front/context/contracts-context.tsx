"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { UNITYFLOW_ADDRESS, TOKEN_ADDRESS } from "@/config";
import { TokenUF, TokenUF__factory, UnityFlow, UnityFlow__factory,  } from "@/typechain";

interface ContractsContextProps {
    provider: ethers.Provider | null;
    browserProvider: ethers.BrowserProvider | null;
    wsProvider: ethers.WebSocketProvider | null;
    tokenUF: TokenUF | null;
    unityFlow: UnityFlow | null;
    // crowdfunding: Crowdfunding | null;
    loadingWallet: boolean;
    connectWallet: () => Promise<void>; 
    signer: ethers.Signer | null;
  }

const ContractsContext = createContext<ContractsContextProps>({
    provider: null,
    browserProvider: null,
    wsProvider: null,
    tokenUF: null,
    unityFlow: null,
    // crowdfunding: null,
    loadingWallet: false,
    connectWallet: async () => {},
    signer: null
});

export const ContractsProvider = ({ children }: { children: React.ReactNode  }) => {
  const [state, setState] = useState({
    provider: null as ethers.Provider | null,
    browserProvider: null as ethers.BrowserProvider | null,
    wsProvider: null as ethers.WebSocketProvider | null,
    unityFlow: null as UnityFlow | null,
    tokenUF: null as TokenUF | null,
    // dao: null as GovernanceUF | null,
    loadingWallet: false,
    signer: null as ethers.Signer | null,
  });
  
  useEffect(() => {
    const initContracts = async () => {
      try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const ws = new ethers.WebSocketProvider("ws://127.0.0.1:8545");

        console.log("ws create")

        ws.on("block", (blockNumber) => {
          console.log("New block:", blockNumber);
        });

        ws.on("error", (error) => {
          console.error("WebSocket error:", error);
        });

        const unityFlow = UnityFlow__factory.connect(UNITYFLOW_ADDRESS, provider);
        const token = TokenUF__factory.connect(TOKEN_ADDRESS, provider);
        // const dao = GovernanceUF__factory.connect(DAO_ADDRESS, provider);
  
        setState({
          provider,
          browserProvider: null,
          wsProvider: ws,
          unityFlow,
          tokenUF: token,
          loadingWallet: false,
          signer: null,
        });
  
        console.log("Контракти ініціалізовано:", { unityFlow, token });

        return () => {
          console.log("ws destroy")
          ws.destroy();
        };
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