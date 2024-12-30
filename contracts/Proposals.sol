// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IGovernance.sol";

contract Proposals is IProposals {
    IGovernance public governance;

    struct Proposal {
        address proposer;
        string description;
        uint amount;
        uint votesFor;
        uint votesAgainst;
        uint votesAbstain;
        mapping(address => bool) hasVoted;
        bool exist;
    }

    mapping(bytes32 => Proposal) public proposals;

    event ProposalCreated(bytes32 indexed id, address indexed proposer, string description, uint256 amount);
    event Voted(bytes32 indexed proposalId, address indexed voter, uint8 voteType, uint256 votingPower);

    modifier onlyGovernance() {
        require(msg.sender == address(governance), "Not governance");
        _;
    }

    constructor(address _governanceContract) {
        governance = IGovernance(_governanceContract);
    }

    function createProposal(bytes32 proposalId, string calldata description, uint256 amount) external onlyGovernance {
        Proposal storage newProposal = proposals[proposalId];
        require(!proposals[proposalId].exist, "Proposal already exists");

        newProposal.proposer = msg.sender;
        newProposal.description = description;
        newProposal.amount = amount;
        newProposal.exist = true;

        emit ProposalCreated(proposalId, msg.sender, description, amount);
    }

    function vote(bytes32 proposalId, uint8 voteType, address voter, uint votingPower) external onlyGovernance {
        Proposal storage proposal = proposals[proposalId];

        require(!proposal.hasVoted[voter], "Already voted");

        if (voteType == 1) {
            proposal.votesFor += votingPower;
        } else if (voteType == 2) {
            proposal.votesAgainst += votingPower;
        } else {
            proposal.votesAbstain += votingPower;
        }

        proposal.hasVoted[voter] = true;
        emit Voted(proposalId, voter, voteType, votingPower);
    }

    function markAsRejected(bytes32 proposalId) external onlyGovernance {
        Proposal storage proposal = proposals[proposalId];
        proposal.rejected = true;
        proposal.exist = false;
        emit ProposalRejected(proposalId);
    }

    function hasChanceToPass(bytes32 proposalId) external view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.exist, "Proposal does not exist");

        return proposal.votesFor > proposal.votesAgainst;
    }
}
