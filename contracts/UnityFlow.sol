// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TokenUF.sol";
import "./Staking.sol";
import "./Company.sol";
import "./Fundraising.sol";

contract UnityFlow {
    TokenUF public token; 

    struct Proposal {
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
    }

    mapping(uint256 => address) public companies;
    mapping(uint256 => bool) public isCompanyActive;
    mapping(uint256 => Proposal) public proposals;

    uint256 public companyCount;
    uint256 public totalDonations;
    uint256 public totalInvestments;
    uint256 public activeCompanies;
    uint256 public closedCompanies;
    uint256 public proposalCount;
    
    uint256 public platformFeePercent = 5;
    uint256 public minTokenBalance = 100 * 10**18;
    

    event CompanyRegistered(uint256 id, address contractAddress);
    event CompanyClosed(uint256 id, address contractAddress);
    event TotalFundsUpdated(uint256 newTotalFunds);
    event ProposalCreated(uint256 id, string description);
    event ProposalExecuted(uint256 id, bool success);

    constructor(address tokenAddress) {
        token = TokenUF(tokenAddress);
    }

    modifier hasMinimumTokens(address user) {
        require(token.balanceOf(user) >= minTokenBalance, "Insufficient token balance to create a company");
        _;
    }

    function transferETH(address to, uint _amount) public  {
        require(_amount < address(this).balance, "Invalid withdraw amount");
        (bool sent, ) = to.call{value: _amount}("");
        require(sent, "Failed to send funds to DAO.");
    }

    function transferUF(address to, uint _amount) public  {
        require(token.balanceOf(address(this)) >= _amount, "not enougth tokens");
        token.transfer(to, _amount);
    }

    // function registerCompany(string memory _name) external hasMinimumTokens(msg.sender) {
    //     require(bytes(_name).length > 0, "Company name cannot be empty");

    //     Company newCompaign = new Company(msg.sender, address(this), address(token), тут шось);

    //     companyCount++;
    //     companies[companyCount] = address(newCompaign);
    //     isCompanyActive[companyCount] = true;
    //     activeCompanies++;

    //     emit CompanyRegistered(companyCount, newCompaign);
    // }

    function closeCompany(uint256 companyId) external {
        require(companies[companyId] != address(0), "Company does not exist");
        require(isCompanyActive[companyId], "Company is already closed");
        
        isCompanyActive[companyId] = false;
        activeCompanies--;
        closedCompanies++;

        emit CompanyClosed(companyId, companies[companyId]);
    }

    function createFundraising(
        string memory title,
        string memory description,
        string memory category,
        uint goalUSD,
        uint deadline,
        string memory image,
        address companyAddress
    ) external {
        require(isCompanyActive[companyAddress], "Company is not active");
        require(deadline > block.timestamp && deadline < block.timestamp + 30 days, "Invalid deadline");
        require(goalUSD >= 10 && goalUSD <= 1000000, "Goal out of range");

        Fundraising newFundraising = new Fundraising(
            companyCount,
            companyAddress,
            title,
            description,
            image,
            category,
            goalUSD,
            deadline,
            token,
            platformFeePercent
        );
    }

    function createProposal(string memory _description) external {
        require(token.balanceOf(msg.sender) > 0, "Only token holders can propose");

        proposalCount++;
        proposals[proposalCount] = Proposal({
            description: _description,
            votesFor: 0,
            votesAgainst: 0,
            executed: false
        });

        emit ProposalCreated(proposalCount, _description);
    }

    function vote(uint256 proposalId, bool support) external {
        require(token.balanceOf(msg.sender) > 0, "Only token holders can vote");
        require(!proposals[proposalId].executed, "Proposal already executed");

        if (support) {
            proposals[proposalId].votesFor += token.balanceOf(msg.sender);
        } else {
            proposals[proposalId].votesAgainst += token.balanceOf(msg.sender);
        }
    }

    function executeProposal(uint256 proposalId) external {
        require(!proposals[proposalId].executed, "Proposal already executed");
        require(proposals[proposalId].votesFor > proposals[proposalId].votesAgainst, "Proposal did not pass");

        proposals[proposalId].executed = true;
        emit ProposalExecuted(proposalId, true);
    }

    function getPlatformStats() external view returns (uint256, uint256, uint256, uint256, uint256) {
        return (companyCount, totalDonations, totalInvestments, activeCompanies, closedCompanies);
    }
    function getAllCampaigns() external view returns (address[] memory) {}

    function updateDonations(uint256 amount) external {
        totalDonations += amount;
        emit TotalFundsUpdated(amount);
    }

    function updateInvestments(uint256 amount) external {
        totalInvestments += amount;
        emit TotalFundsUpdated(amount);
    }
}

