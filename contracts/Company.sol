// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./UnityFlow.sol";
import "./TokenUF.sol";

contract Company {
    UnityFlow public unityFlow;
    TokenUF public token;
    Crowdfunding public crowdfunding;

    address public founder;
    address[] public cofounders;

    uint256 public totalFunds;
    address[] public fundraisers;

    uint256 public totalInvestments;
    mapping(address => uint256) public investorBalances;

    event FundsReceived(uint256 amount, address sender);
    event FundsWithdrawn(uint256 amount, address receiver);

    event FundraiserCreated(address fundraiserContract);
    event FundraiserCompleted(address fundraiserContract, uint totalCollected);

    event InvestmentReceived(address investor, uint256 amount);
    event InvestmentWithdrawn(address investor, uint256 amount);

    event CofounderAdded(address cofounder);

    modifier onlyFounderOrCofounder() {
        require(msg.sender == founder || isCofounder(msg.sender), "Not authorized");
        _;
    }

    constructor(address _founder, address _unityFlow, address _token, address _crowdfunding) Ownable(_founder) {
        require(_founder != address(0), "Invalid founder address");
        require(_unityFlow != address(0), "Invalid UnityFlow address");
        require(_token != address(0), "Invalid TokenUF address");
        require(_crowdfunding != address(0), "Invalid Crowdfunding address");
        
        founder = _founder;
        unityFlow = UnityFlow(_unityFlow);
        token = TokenUF(_token);
        crowdfunding = Crowdfunding(_crowdfunding);
    }

    function receiveFunds() external payable {
        require(msg.value > 0, "Must send some funds");
        totalFunds += msg.value;
        emit FundsReceived(msg.value, msg.sender);
    }

    function widthdrawETH(uint _amount) public onlyOwner {
        require(amount > 0 && amount <= totalFunds, "Invalid withdraw amount");
        totalFunds -= amount;
        (bool sent, ) = dao.call{value: _amount}("");
        require(sent, "Failed to send funds to DAO.");
        emit FundsWithdrawn(amount, msg.sender);
    }

    function widthdrawUF(uint _amount) public onlyOwner {
        require(token.balanceOf(address(this)) >= _amount, "not enougth tokens");
        token.transfer(dao, _amount);
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
        address newFundraiser = crowdfunding.createCampaign(
            title, description, category, goalUSD, deadline, image
        );
        fundraisers.push(newFundraiser);
        emit FundraiserCreated(newFundraiser);
    }

    function getCompanyFundraisers() external view returns (address[] memory) {
        return fundraisers;
    }

    function onFundraiserCompleted(address fundraiser, uint totalCollected) external {
        require(_isFundraiser(fundraiser), "Caller is not a fundraiser");
        totalFunds += totalCollected;
        emit FundraiserCompleted(fundraiser, totalCollected);
    }

    function invest(uint256 amount) external {
        require(token.balanceOf(msg.sender) >= amount, "Insufficient token balance");
        token.transferFrom(msg.sender, address(this), amount);
        investorBalances[msg.sender] += amount;
        totalInvestments += amount;
        emit InvestmentReceived(msg.sender, amount);
    }

    function withdrawInvestment(uint256 amount) external {
        require(investorBalances[msg.sender] >= amount, "Insufficient investment balance");
        token.transfer(msg.sender, amount);
        investorBalances[msg.sender] -= amount;
        totalInvestments -= amount;
        emit InvestmentWithdrawn(msg.sender, amount);
    }

    function addCofounder(address cofounder) external onlyOwner {
        require(cofounder != address(0), "Invalid cofounder address");
        cofounders.push(cofounder);
        emit CofounderAdded(cofounder);
    }

    function isCofounder(address user) public view returns (bool) {
        for (uint i = 0; i < cofounders.length; i++) {
            if (cofounders[i] == user) {
                return true;
            }
        }
        return false;
    }
}