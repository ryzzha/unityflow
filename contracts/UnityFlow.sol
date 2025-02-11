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
    event PlatformFeeReceived(uint256 amount, string currency);

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

    function updatePlatformFee(uint256 newFee) external {
        require(newFee <= 10, "Fee cannot exceed 10%"); 
        require(msg.sender == address(proposalManager), "Only executed proposal can change fee");
        platformFeePercent = newFee;
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

    function registerCompany(string memory name, string memory image, string memory description, address[] memory cofounders) external hasMinimumTokens(msg.sender) {
        require(bytes(name).length > 0, "Company name cannot be empty");
        require(bytes(image).length > 0, "Company image cannot be empty");
        require(bytes(description).length > 0, "Company description cannot be empty");

        companyCount++;
        Company newCompany = new Company(companyCount, name, image, description, msg.sender, cofounders, address(this), address(token));

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
        return fundraisingManager.createFundraising(address(this), id, msg.sender, title, description, category, goalUSD, deadline, image, platformFeePercent);
    }

    function createProposal(
        address target,    
        bytes calldata data, 
        string calldata description,
        uint256 deadline   
    ) external {
        proposalManager.createProposal(msg.sender, target, data, description, deadline);
    }

    function vote(bytes32 proposalHash, bool support) external {
        proposalManager.vote(proposalHash, msg.sender, support);
    }

    function executeProposal(bytes32 proposalHash, address target, string calldata description, bytes calldata data) external {
        proposalManager.executeProposal(proposalHash, target, description, data);
    }

    function getPlatformStats() external view returns (
        uint256 companyCount_,
        uint256 totalDonationsETH,
        uint256 totalDonationsUF,
        uint256 totalInvestmentsETH,
        uint256 totalInvestmentsUF,
        uint256 activeCompanies,
        uint256 closedCompanies,
        uint256 proposalCount,
        uint256 totalVotes,
        uint256 platformBalanceETH,
        uint256 platformBalanceUF
    ) {
        activeCompanies = getActiveCompanies();
        closedCompanies = companyCount > activeCompanies ? (companyCount - activeCompanies) : 0;
        proposalCount = proposalManager.getProposalHashes().length;
        totalVotes = proposalManager.getTotalVotes();

        return (
            companyCount,                              
            getTotalDonations("ETH"),  
            getTotalDonations("UF"),   
            getTotalInvestments("ETH"), 
            getTotalInvestments("UF"),  
            activeCompanies,                           
            closedCompanies,                    
            proposalCount,                          
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

    function receivePlatformFeeETH() external payable {
        require(msg.value > 0, "Must send ETH fee");
        emit PlatformFeeReceived(msg.value, "ETH");
    }

    function receivePlatformFeeUF(uint256 amount) external {
        require(amount > 0, "Must send UF fee");
        require(token.balanceOf(msg.sender) >= amount, "Insufficient token balance");

        token.transferFrom(msg.sender, address(this), amount);
        emit PlatformFeeReceived(amount, "UF");
    }
}

