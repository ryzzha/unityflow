// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GovernanceUF is Ownable {
    struct Proposal {
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
    }

    IERC20 public token;
    uint private _proposalIds;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 id, string description);
    event Voted(uint256 id, address voter, bool support);
    event ProposalExecuted(uint256 id);

    constructor(address tokenAddress) Ownable(address(this)) {
        token = IERC20(tokenAddress);
    }

    function createProposal(string memory description) external {
        _proposalIds++;

        proposals[_proposalIds] = Proposal({
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + 3 days,
            executed: false
        });

        emit ProposalCreated(_proposalIds, description);
    }

    function vote(uint256 proposalId, bool support) external {
        require(block.timestamp < proposals[proposalId].deadline, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        uint256 voterBalance = token.balanceOf(msg.sender);
        require(voterBalance > 0, "No tokens to vote");

        if (support) {
            proposals[proposalId].votesFor += voterBalance;
        } else {
            proposals[proposalId].votesAgainst += voterBalance;
        }

        hasVoted[proposalId][msg.sender] = true;
        emit Voted(proposalId, msg.sender, support);
    }

    function executeProposal(uint256 proposalId) external onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.deadline, "Voting still ongoing");
        require(!proposal.executed, "Already executed");

        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }
}
