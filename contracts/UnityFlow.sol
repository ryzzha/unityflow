// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TokenUF.sol";
import "./Staking.sol";
import "./Company.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./MockAgregator.sol";
import "./FundraisingManager.sol";
import "./ProposalManager.sol";

contract UnityFlow {
    TokenUF public token; 
    FundraisingManager public fundraisingManager;
    ProposalManager public proposalManager;
    // AggregatorV3Interface public ethPriceFeed;
    // AggregatorV3Interface public tokenPriceFeed;

    MockPriceFeed public ethPriceFeed;
    MockPriceFeed public tokenPriceFeed;

    uint256 public companyCount;
    mapping(uint256 => address) public companies;
    mapping(address => bool) public isCompanyActive;
    
    uint256 public platformFeePercent = 5;
    uint256 public minTokenBalance = 100 * 10**18;

    event CompanyRegistered(uint256 id, address contractAddress, address founder);
    event CompanyClosed(uint256 id, address contractAddress, address founder);

    event TotalFundsUpdated(uint256 newTotalFunds, string currency, string kind);

    event ProposalCreated(string description, uint256 deadline);
    event VoteCast(uint256 proposalId, address voter, bool support, uint256 votingPower);
    event ProposalExecuted(uint256 id, string description, bool success);

    constructor(address tokenAddress, address fundraisingManagerAddress, address proposalManagerAddress, address _ethPriceFeed, address _tokenPriceFeed) {
        token = TokenUF(tokenAddress);
        fundraisingManager = FundraisingManager(fundraisingManagerAddress);
        proposalManager = ProposalManager(proposalManagerAddress);

        // ethPriceFeed = AggregatorV3Interface(_ethPriceFeed);
        // tokenPriceFeed = AggregatorV3Interface(_tokenPriceFeed);

        ethPriceFeed = MockPriceFeed(_ethPriceFeed);
        tokenPriceFeed = MockPriceFeed(_tokenPriceFeed);
    }

    modifier hasMinimumTokens(address user) {
        require(token.balanceOf(user) >= minTokenBalance, "Insufficient token balance to create a company");
        _;
    }

    modifier onlyTokenHolder(uint amount) {
        require(token.balanceOf(msg.sender) > amount, "Only token holders can interact");
        _;
    }

    function transferETH(address to, uint _amount) public  {
        require(_amount <= address(this).balance, "Invalid withdraw amount");
        (bool sent, ) = to.call{value: _amount}("");
        require(sent, "Failed to send funds to DAO.");
    }

    function transferUF(address to, uint _amount) public  {
        require(token.balanceOf(address(this)) >= _amount, "not enougth tokens");
        require(_amount > 0, "Amount must be greater than zero");

        token.transfer(to, _amount);
    }

    function registerCompany(string memory name) external hasMinimumTokens(msg.sender) {
        require(bytes(name).length > 0, "Company name cannot be empty");

        companyCount++;
        Company newCompany = new Company(companyCount, name, msg.sender, address(this), address(token));

        companies[companyCount] = address(newCompany);
        isCompanyActive[address(newCompany)] = true;

        emit CompanyRegistered(companyCount, address(newCompany), msg.sender);
    }

    function closeCompany(uint256 companyId) external {
        address payable companyAddress = payable(companies[companyId]);

        require(companyAddress != address(0), "Company does not exist");
        require(isCompanyActive[companyAddress], "Company is already closed");
        require(msg.sender == companyAddress || msg.sender == Company(companyAddress).founder(), "Not authorized");

        isCompanyActive[companyAddress] = false;

        emit CompanyClosed(companyId, companyAddress, msg.sender);
    }

    function getAllCompanies() external view returns (address[] memory) {
        address[] memory companyList = new address[](companyCount);
        for (uint256 i = 1; i <= companyCount; i++) {
            companyList[i - 1] = companies[i];
        }
        return companyList;
    }

    function createFundraising(
        uint id,
        string memory title,
        string memory description,
        string memory category,
        uint goalUSD,
        uint deadline,
        string memory image
    ) external returns(address) {
        require(isCompanyActive[msg.sender], "Only active companies can create fundraisers");
        return fundraisingManager.createFundraising(id, msg.sender, title, description, category, goalUSD, deadline, image);
    }

    function createProposal(
        address target,    
        bytes calldata data, 
        string calldata description,
        uint256 deadline   
    ) external {
        proposalManager.createProposal(msg.sender, target, data, description, deadline);
        emit ProposalCreated(description, deadline);
    }

    function vote(uint256 proposalId, bool support) external {
        proposalManager.vote(proposalId, msg.sender, support);
        emit VoteCast(proposalId, msg.sender, support, token.balanceOf(msg.sender));
    }

    function executeProposal(uint256 proposalId, address target, string calldata description, bytes calldata data) external {
        bool success = proposalManager.executeProposal(proposalId, target, description, data);
        emit ProposalExecuted(proposalId, description, success);
    }

    function getPlatformStats() external view returns (
        uint256 companyCount_,
        uint256 totalDonationsETH,
        uint256 totalDonationsUF,
        uint256 totalInvestmentsETH,
        uint256 totalInvestmentsUF,
        uint256 activeCompanies,
        uint256 closedCompanies,
        uint256 proposalCount_,
        uint256 totalVotes,
        uint256 platformBalanceETH,
        uint256 platformBalanceUF
    ) {
        activeCompanies = getActiveCompanies();
        closedCompanies = companyCount > activeCompanies ? (companyCount - activeCompanies) : 0;
        proposalCount_ = proposalManager.getProposalCount();
        totalVotes = proposalManager.getTotalVotes();

        return (
            companyCount,                              
            getTotalDonations("ETH"),  
            getTotalDonations("UF"),   
            getTotalInvestments("ETH"), 
            getTotalInvestments("UF"),  
            activeCompanies,                           
            closedCompanies,                    
            proposalCount_,                          
            totalVotes,                                 
            address(this).balance,                      
            token.balanceOf(address(this))          
        );
    }

    function getAllCompanies(bool onlyActive) external view returns (address[] memory) {
        address[] memory companyList = new address[](companyCount);
        uint256 index = 0;

        for (uint256 i = 1; i <= companyCount; i++) {
            if (!onlyActive || isCompanyActive[companies[i]]) {
                companyList[index] = companies[i];
                index++;
            }
        }

        assembly {
            mstore(companyList, index) 
        }
        
        return companyList;
    }

    function updateDonations(uint256 amount, string calldata currency) external {
        fundraisingManager.updateDonations(amount, currency);
        emit TotalFundsUpdated(amount, currency, "donate");
    }
    function increaseInvestments(uint256 amount, string calldata currency) external {
        fundraisingManager.increaseInvestments(amount, currency);
        emit TotalFundsUpdated(amount, currency, "investment_added");
    }
    function decreaseInvestments(uint256 amount, string calldata currency) external {
        fundraisingManager.decreaseInvestments(amount, currency);
        emit TotalFundsUpdated(amount, currency, "investment_removed");
    }

    function getActiveCompanies() public view returns (uint256 activeCount) {
        for (uint256 i = 1; i <= companyCount; i++) {
            if (isCompanyActive[companies[i]]) {
                activeCount++;
            }
        }
        return activeCount;
    }

   function getTotalDonations(string memory currency) public view returns (uint256) {
        return fundraisingManager.getTotalDonations(currency);
    }

    function getTotalInvestments(string memory currency) public view returns (uint256) {
        return fundraisingManager.getTotalInvestments(currency);
    }
}

