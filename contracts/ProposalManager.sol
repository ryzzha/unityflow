// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TokenUF.sol";

contract ProposalManager {
    TokenUF public token;

    struct Proposal {
        bytes32 actionHash;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        mapping(address => bool) voted;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    mapping(address => uint256) public lastProposalTime;
    uint256 public proposalCooldown = 5 days;

    constructor(address tokenAddress) {
        token = TokenUF(tokenAddress);
    }

    function createProposal(
        address creator,
        address target,
        bytes calldata data,
        string calldata description,
        uint256 deadline
    ) external {
        require(deadline > block.timestamp, "Invalid deadline");
        require(block.timestamp >= lastProposalTime[creator] + proposalCooldown, "Wait before creating a new proposal");

        bytes32 actionHash = keccak256(abi.encodePacked(target, data, description, deadline));
        proposalCount++;

        Proposal storage newProposal = proposals[proposalCount];
        newProposal.actionHash = actionHash;
        newProposal.description = description;
        newProposal.deadline = deadline;
        newProposal.executed = false;

        lastProposalTime[creator] = block.timestamp;
    }

    function vote(uint256 proposalId, address voter, bool support) external {
        Proposal storage proposal = proposals[proposalId];

        require(!proposal.executed, "Proposal already executed");
        require(block.timestamp < proposal.deadline, "Voting period has ended");
        require(!proposal.voted[voter], "Already voted");

        uint256 voterPower = token.balanceOf(voter);

        if (support) {
            proposal.votesFor += voterPower;
        } else {
            proposal.votesAgainst += voterPower;
        }

        proposal.voted[voter] = true;
    }

    function executeProposal(uint256 proposalId, address target, string calldata description, bytes calldata data) external returns(bool) {
        Proposal storage proposal = proposals[proposalId];

        require(!proposal.executed, "Proposal already executed");
        require(block.timestamp >= proposal.deadline, "Voting period has not ended");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal did not pass");
        require(proposal.votesFor + proposal.votesAgainst >= (token.totalSupply() * 10 / 100), "Not enough votes");


        require(
            keccak256(abi.encodePacked(target, data, description, proposal.deadline)) == proposal.actionHash,
            "Invalid execution parameters"
        );

        (bool success, ) = target.call(data);
        require(success, "Function execution failed");

        proposal.executed = true;

        return success;
    }

    function getProposalCount() external view returns (uint256) {
        return proposalCount;
    }

    function getTotalVotes() external view returns (uint256 totalVotes) {
        for (uint256 i = 0; i < proposalCount; i++) {
            totalVotes += proposals[i].votesFor + proposals[i].votesAgainst;
        }
    }
}
