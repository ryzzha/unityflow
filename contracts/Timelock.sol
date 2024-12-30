// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Timelock {
    address public governance;

    struct QueuedProposal {
        address target;
        uint256 value;
        bytes data;
        uint startTime;
        uint endTime;
        bool executed;
        bool rejected;
    }

    mapping(bytes32 => QueuedProposal) public queuedProposals;

    event ProposalQueued(bytes32 indexed proposalId, uint256 startTime, uint256 endTime);
    event ProposalRejected(bytes32 indexed proposalId);
    event ProposalExecuted(bytes32 indexed proposalId);

    modifier onlyGovernance() {
        require(msg.sender == governance, "Only Governance can execute");
        _;
    }

    constructor(address _governance) {
        governance = _governance;
    }

    function queueProposal(bytes32 proposalId, address target, uint256 value, bytes calldata data, uint delay, uint duration) external onlyGovernance {
        uint256 startTime = block.timestamp + delay;
        uint256 endTime = block.timestamp + delay + duration;
        queuedProposals[proposalId] = QueuedProposal(target, value, data, startTime, endTime, false, false);

        emit ProposalQueued(proposalId, startTime, endTime);
    }

    function isVotingOpen(bytes32 proposalId) external view returns (bool) {
        QueuedProposal storage proposal = queuedProposals[proposalId];
        return block.timestamp >= proposal.startTime && block.timestamp < proposal.endTime && !proposal.rejected;
    }

    function executeProposal(bytes32 proposalId) external onlyGovernance {
        QueuedProposal storage proposal = queuedProposals[proposalId];
        require(block.timestamp >= proposal.endTime, "Delay not passed");
        require(!proposal.rejected, "Proposal rejected");
        require(!proposal.executed, "Proposal already executed");

        (bool success, ) = proposal.target.call{value: proposal.value}(proposal.data);
        require(success, "Execution failed");

        proposal.executed = true;

        emit ProposalExecuted(proposalId);
    }
}
