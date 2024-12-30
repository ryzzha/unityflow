// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGovernance {
    event ProposalApproved(uint256 indexed proposalId);
    event ProposalRejected(uint256 indexed proposalId);

    function approveProposal(uint256 proposalId) external;
    function rejectProposal(uint256 proposalId) external;
    function isProposalApproved(uint256 proposalId) external view returns (bool);
}