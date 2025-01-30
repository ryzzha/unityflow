// // src/context/ContractsContext.tsx
// import { createContext, useContext, useEffect, useState } from "react";
// import { ethers } from "ethers";
// import TokenABI from "../abis/TokenContract.json";
// import CampaignABI from "../abis/CampaignContract.json";
// import DAOABI from "../abis/DAOContract.json";

// const ContractsContext = createContext(null);

// export const ContractsProvider = ({ children }) => {
//   const [contracts, setContracts] = useState({ token: null, campaign: null, dao: null });

//   useEffect(() => {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();

//     setContracts({
//       token: new ethers.Contract("0xTokenAddress", TokenABI, signer),
//       campaign: new ethers.Contract("0xCampaignAddress", CampaignABI, signer),
//       dao: new ethers.Contract("0xDAOAddress", DAOABI, signer),
//     });
//   }, []);

//   return <ContractsContext.Provider value={contracts}>{children}</ContractsContext.Provider>;
// };

// export const useContracts = () => {
//   return useContext(ContractsContext);
// };