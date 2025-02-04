import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Деплоїмо TokenUF від імені:", deployer.address);

  const TokenUF = await ethers.getContractFactory("TokenUF"); 
  const token = await TokenUF.deploy(100000);

  await token.waitForDeployment();
  console.log("TokenUF контракт деплоєно за адресою:", await token.getAddress());

  const Governance = await ethers.getContractFactory("GovernanceUF");
  const governance = await Governance.deploy(token.target);

  await governance.waitForDeployment();
  console.log("Governance контракт деплоєно за адресою:", await governance.getAddress());

  console.log("Передаємо власність токена DAO...");
  const tx = await token.transferOwnership(governance.target);
  await tx.wait();
  console.log("Власність токена передана DAO:", governance.target);

  const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy(token.target, governance.target, ethers.ZeroAddress, ethers.ZeroAddress);
 
  await crowdfunding.waitForDeployment();
  console.log("Crowdfunding контракт деплоєно за адресою:", await crowdfunding.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
