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

    mapping(bytes32 => Proposal) public proposals; 
    mapping(bytes32 => bool) public existingProposals;
    bytes32[] public proposalHashes; 

    mapping(address => uint256) public lastProposalTime;
    uint256 public proposalCooldown = 5 days;

    event ProposalCreated(uint256 index, bytes32 proposalHash, address creator, address target, string description, uint256 deadline);
    event VoteCast(bytes32 proposalHash, address voter, bool support, uint256 votingPower);
    event ProposalExecuted(bytes32 proposalHash, address target, string description, bool success);

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
        require(!existingProposals[actionHash], "Proposal already exists");

        Proposal storage newProposal = proposals[actionHash];
        newProposal.actionHash = actionHash;
        newProposal.description = description;
        newProposal.deadline = deadline;
        newProposal.executed = false;

        existingProposals[actionHash] = true;
        proposalHashes.push(actionHash); 
        lastProposalTime[creator] = block.timestamp;

        uint256 index = proposalHashes.length - 1; 
        emit ProposalCreated(index, actionHash, creator, target, description, deadline);
    }

    function vote(bytes32 proposalHash, address voter, bool support) external {
        Proposal storage proposal = proposals[proposalHash];

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
        emit VoteCast(proposalHash, voter, support, voterPower);
    }

    function executeProposal(bytes32 proposalHash, address target, string calldata description, bytes calldata data) external {
        Proposal storage proposal = proposals[proposalHash];

        require(!proposal.executed, "Proposal already executed");
        require(proposal.votesFor + proposal.votesAgainst >= (token.totalSupply() * 10 / 100), "Not enough votes");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal did not pass");
        require(block.timestamp >= proposal.deadline, "Voting period has not ended");

        require(
            keccak256(abi.encodePacked(target, data, description, proposal.deadline)) == proposal.actionHash,
            "Invalid execution parameters"
        );

        (bool success, ) = target.call(data);
        require(success, "Function execution failed");

        proposal.executed = true;
        emit ProposalExecuted(proposalHash, target, description, success);
    }

    function getProposalHashes() external view returns (bytes32[] memory) {
        return proposalHashes;
    }

    function getTotalVotes() external view returns (uint256 totalVotes) {
        for (uint256 i = 0; i < proposalHashes.length; i++) {
            bytes32 proposalHash = proposalHashes[i];
            totalVotes += proposals[proposalHash].votesFor + proposals[proposalHash].votesAgainst;
        }
    }
}
