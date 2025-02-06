// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./UnityFlow.sol";
import "./TokenUF.sol";

contract Company is Ownable {
    UnityFlow public unityFlow;
    TokenUF public token;

    uint id;
    string name;

    address public founder;
    address[] public cofounders;

    uint256 public totalFundsETH;
    uint256 public totalFundsUF;
    address[] public fundraisers;

    uint256 public totalInvestments;
    mapping(address => uint256) public investorBalances;

    uint public fundraisingCount;

    event CofounderAdded(address cofounder);

    event InvestmentReceived(address investor, uint256 amount);
    event InvestmentWithdrawn(address investor, uint256 amount);

    event FundraiserCreated(address fundraiserContract);
    event FundraiserCompleted(address fundraiserContract, uint totalCollectedETH, uint totalCollectedUF);

    event FundsReceived(uint256 amount, address sender);
    event FundsWithdrawn(uint256 amount, address receiver);

    modifier onlyFounderOrCofounder() {
        require(msg.sender == founder || _isCofounder(msg.sender), "Not authorized");
        _;
    }

    constructor(uint _id, string memory _name, address _founder, address _unityFlow, address _token) Ownable(_founder) {
        require(_founder != address(0), "Invalid founder address");
        require(_unityFlow != address(0), "Invalid UnityFlow address");
        require(_token != address(0), "Invalid TokenUF address");
        
        id = _id;
        name = _name;
        founder = _founder;
        unityFlow = UnityFlow(_unityFlow);
        token = TokenUF(_token);
    }

    function receiveFunds() external payable {
        require(msg.value > 0, "Must send some funds");
        totalFundsETH += msg.value;
        emit FundsReceived(msg.value, msg.sender);
    }

    function widthdrawETH(uint amount) public onlyOwner {
        require(amount > 0 && amount <= totalFundsETH, "Invalid withdraw amount");
        totalFundsETH -= amount;
        (bool sent, ) = address(unityFlow).call{value: amount}("");
        require(sent, "Failed to send funds to DAO.");
        emit FundsWithdrawn(amount, msg.sender);
    }

    function widthdrawUF(uint amount) public onlyOwner {
        require(token.balanceOf(address(this)) >= amount, "not enougth tokens");
        totalFundsUF -= amount;
        token.transfer(address(unityFlow), amount);
    }

    function fullWithdraw() external onlyOwner {
        if (address(this).balance > 0) {
            widthdrawETH(address(this).balance);
        }
        if (token.balanceOf(address(this)) > 0) {
            widthdrawUF(token.balanceOf(address(this)));
        }
    }

    function createFundraising(
        string memory title,
        string memory description,
        string memory category,
        uint goalUSD,
        uint deadline,
        string memory image
    ) external onlyFounderOrCofounder {
        fundraisingCount++;
        address newFundraiser = unityFlow.createFundraising(
            fundraisingCount, title, description, category, goalUSD, deadline, image
        );
        fundraisers.push(newFundraiser);
        emit FundraiserCreated(newFundraiser);
    }

    function getCompanyFundraisers() external view returns (address[] memory) {
        return fundraisers;
    }

    function onFundraiserCompleted(uint totalCollectedETH, uint totalCollectedUF) external {
        require(_isFundraiser(msg.sender), "Caller is not a fundraiser");
        totalFundsETH += totalCollectedETH;
        totalFundsUF += totalCollectedUF;
        fundraisingCount--;
        emit FundraiserCompleted(msg.sender, totalCollectedETH, totalCollectedUF);
    }

    function invest(uint256 amount) external {
        require(token.balanceOf(msg.sender) >= amount, "Insufficient token balance");
        token.transferFrom(msg.sender, address(this), amount);

        investorBalances[msg.sender] += amount;
        totalInvestments += amount;

        unityFlow.increaseInvestments(amount, "UF");

        emit InvestmentReceived(msg.sender, amount);
    }

    function withdrawInvestment(uint256 amount) external {
        require(investorBalances[msg.sender] >= amount, "Insufficient investment balance");
        
        investorBalances[msg.sender] -= amount;
        totalInvestments -= amount;

        token.transfer(msg.sender, amount);

        unityFlow.decreaseInvestments(amount, "UF"); 

        emit InvestmentWithdrawn(msg.sender, amount);
    }

    function addCofounder(address cofounder) external onlyOwner {
        require(cofounder != address(0), "Invalid cofounder address");
        cofounders.push(cofounder);
        emit CofounderAdded(cofounder);
    }

    function _isCofounder(address user) private view returns (bool) {
        for (uint i = 0; i < cofounders.length; i++) {
            if (cofounders[i] == user) {
                return true;
            }
        }
        return false;
    }

    function _isFundraiser(address fundraiser) private view returns (bool) {
        for (uint i = 0; i < fundraisers.length; i++) {
            if (fundraisers[i] == fundraiser) {
                return true;
            }
        }
        return false;
    }
}