// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Treasury {
    address public governance;

    mapping(bytes32 => uint256) public proposalFunds;

    event FundsReceived(address indexed from, uint256 amount);
    event FundsReleased(bytes32 indexed proposalId, address indexed recipient, uint256 amount);

    constructor(address _governance) {
        governance = _governance;
    }

    modifier onlyOwner() {
        require(msg.sender == governance, "Only governance can manipulete with funds");
        _;
    }

    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    function allocateFunds(bytes32 proposalId, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient funds in Treasury");

        proposalFunds[proposalId] = amount;
    }

    function releaseFunds(uint256 proposalId, address payable recipient) external onlyOwner {
        uint256 amount = proposalFunds[proposalId];
        require(amount > 0, "No funds allocated for this proposal");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");

        proposalFunds[proposalId] = 0;

        emit FundsReleased(proposalId, recipient, amount);
    }

    function treasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
