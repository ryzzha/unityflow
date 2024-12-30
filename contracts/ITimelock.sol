// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITimelock {
    event TimelockActivated(uint256 indexed proposalId, uint256 unlockTime);
    event FundsReleased(uint256 indexed proposalId, address indexed recipient, uint256 amount);

    function setTimelock(uint256 proposalId, uint256 duration) external;
    function executeTimelockedProposal(uint256 proposalId, address treasury, address recipient, uint256 amount) external;
    function getUnlockTime(uint256 proposalId) external view returns (uint256);
}
