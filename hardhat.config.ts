import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337, // Chain ID для локальної мережі Hardhat
    },
    localhost: {
      url: "http://127.0.0.1:8545", // RPC-адреса для `npx hardhat node`
      chainId: 1337, // Такий самий, як у hardhat
    },
  },
  typechain: {
    outDir: "./front/typechain",
    target: "ethers-v6",
  },
};

export default config;
