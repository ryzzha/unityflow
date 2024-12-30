// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IProposals {
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 amount;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 creationTime;
        bool executed;
    }

    event ProposalCreated(uint256 indexed id, address indexed proposer, string description, uint256 amount);
    event Voted(uint256 indexed proposalId, address indexed voter, bool vote);
    event ProposalExecuted(uint256 indexed id);

    function createProposal(string calldata description, uint256 amount) external;
    function vote(uint256 proposalId, bool support) external;
    function getProposal(uint256 proposalId) external view returns (Proposal memory);
    function executeProposal(uint256 proposalId) external;
}