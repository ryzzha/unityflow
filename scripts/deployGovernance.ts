import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Деплоїмо Governance від імені:", deployer.address);

//   const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Заміни на реальну адресу `TokenUF`
//   const proposalsAddress = "0xProposalsContract"; // Замініть на контракт Proposal
//   const timelockAddress = "0xTimelockContract"; // Замініть на контракт Timelock

  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy();

  await governance.waitForDeployment();
  console.log("Governance контракт деплоєно за адресою:", await governance.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
