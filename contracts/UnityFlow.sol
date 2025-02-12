// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TokenUF.sol";
// import "./Staking.sol";
import "./Company.sol";
// import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./MockAgregator.sol";
import "./CompanyManager.sol";
import "./FundraisingManager.sol";
import "./ProposalManager.sol";

contract UnityFlow {
    TokenUF public token; 
    CompanyManager public companyManager;
    FundraisingManager public fundraisingManager;
    ProposalManager public proposalManager;
    // AggregatorV3Interface public ethPriceFeed;
    // AggregatorV3Interface public tokenPriceFeed;

    MockPriceFeed public ethPriceFeed;
    MockPriceFeed public tokenPriceFeed;
    
    uint256 public platformFeePercent = 5;
    uint256 public minTokenBalance = 100 * 10**18;

    event TotalFundsUpdated(uint256 newTotalFunds, string currency, string kind);
    event PlatformFeeReceived(uint256 amount, string currency);

    constructor(address tokenAddress, address fundraisingManagerAddress, address proposalManagerAddress, address _ethPriceFeed, address _tokenPriceFeed) {
        token = TokenUF(tokenAddress);
        companyManager = new CompanyManager(address(token));
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

    function registerCompany(string memory name, string memory image, string memory description, string memory category, address[] memory cofounders) external hasMinimumTokens(msg.sender) {
        companyManager.registerCompany(name, image, description, category, cofounders, msg.sender);
    }

    function closeCompany(uint256 companyId) external {
        companyManager.closeCompany(companyId, msg.sender);
    }

    function addCompanyToUser(address user, address company) external {
        companyManager.addCompanyToUser(user, company);
    }

    function removeCompanyFromUser(address user, address company) external {
        companyManager.removeCompanyFromUser(user, company);
    }

    function getCompanyAddress(uint companyId) external view returns(address) {
        return companyManager.getCompanyAddress(companyId);
    }

    function isActiveCompany(address company) external view returns(bool) {
        return companyManager.isActiveCompany(company);
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
        require(companyManager.isActiveCompany(msg.sender), "Only active companies can create fundraisers");
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
        uint256 totalCompanies = companyManager.companyCount(); 
        uint256 activeCompanies_ = getActiveCompanies(); 

        return (
            totalCompanies,                            
            getTotalDonations("ETH"),  
            getTotalDonations("UF"),   
            getTotalInvestments("ETH"), 
            getTotalInvestments("UF"),  
            activeCompanies_,                           
            totalCompanies > activeCompanies_ ? (totalCompanies - activeCompanies_) : 0, 
            proposalManager.getProposalHashes().length,   
            proposalManager.getTotalVotes(),               
            address(this).balance,                      
            token.balanceOf(address(this))              
        );
    }

    function getAllCompanies(bool onlyActive) external view returns (address[] memory) {
        uint256 totalCompanies = companyManager.companyCount(); 
        address[] memory companyList = new address[](totalCompanies);
        uint256 index = 0;

        for (uint256 i = 0; i < totalCompanies; i++) { 
            address companyAddress = companyManager.companies(i); 

            if (!onlyActive || companyManager.isActiveCompany(companyAddress)) {
                companyList[index] = companyAddress;
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
        uint256 totalCompanies = companyManager.companyCount(); // Отримуємо загальну кількість компаній

        for (uint256 i = 0; i < totalCompanies; i++) { // Починаємо з 0
            address companyAddress = companyManager.companies(i); // Отримуємо адресу компанії

            if (companyAddress != address(0) && companyManager.isCompanyActive(companyAddress)) { 
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

