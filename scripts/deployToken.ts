import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Деплоїмо TokenUF від імені:", deployer.address);

  const TokenUF = await ethers.getContractFactory("TokenUF");
  const token = await TokenUF.deploy();

  await token.waitForDeployment();
  console.log("TokenUF контракт деплоєно за адресою:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
