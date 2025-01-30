import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  typechain: {
    outDir: "../front/typechain",
    target: "ethers-v6",
  },
};

export default config;
