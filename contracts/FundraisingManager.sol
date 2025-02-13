// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Fundraising.sol";
import "./TokenUF.sol";
// import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./MockAgregator.sol";

contract FundraisingManager {
    TokenUF public token;
    // AggregatorV3Interface public ethPriceFeed;
    // AggregatorV3Interface public tokenPriceFeed;

    MockPriceFeed public ethPriceFeed;
    MockPriceFeed public tokenPriceFeed;

    mapping(string => uint256) public donationsByCurrency;
    mapping(string => uint256) public investmentsByCurrency;

    address[] public fundraisers; 

    constructor(address tokenAddress, address _ethPriceFeed, address _tokenPriceFeed) {
        token = TokenUF(tokenAddress);
        
        ethPriceFeed = MockPriceFeed(_ethPriceFeed);
        tokenPriceFeed = MockPriceFeed(_tokenPriceFeed);
    }

    function createFundraising(
        address unityFlowAddress,
        uint id,
        address company,
        string memory title,
        string memory description,
        string memory category,
        uint goalUSD,
        uint deadline,
        string memory image,
        uint platformFeePercent
    ) external returns(address) {
        require(deadline > block.timestamp && deadline < block.timestamp + 30 days, "Invalid deadline");
        require(goalUSD >= 10 && goalUSD <= 1000000, "Goal out of range");

        FundraisingParams memory params = FundraisingParams({
            id: id,
            company: company,
            title: title,
            description: description,
            image: image,
            category: category,
            goalUSD: goalUSD,
            deadline: deadline,
            token: token,
            platformFeePercent: platformFeePercent
        });

        Fundraising newFundraising = new Fundraising(unityFlowAddress, params, address(ethPriceFeed), address(tokenPriceFeed));
        fundraisers.push(address(newFundraising));
        return address(newFundraising);
    }

    function updateDonations(uint256 amount, string calldata currency) external {
        donationsByCurrency[currency] += amount;
    }

    function increaseInvestments(uint256 amount, string calldata currency) external {
        investmentsByCurrency[currency] += amount;
    }

    function decreaseInvestments(uint256 amount, string calldata currency) external {
        require(investmentsByCurrency[currency] >= amount, "Not enough investments in currency");

        investmentsByCurrency[currency] -= amount;
    }

    function getTotalDonations(string memory currency) external view returns (uint256) {
        return donationsByCurrency[currency];
    }

    function getTotalInvestments(string memory currency) external view returns (uint256) {
        return investmentsByCurrency[currency];
    }

    function getFundraisers() external view returns (address[] memory) {
        return fundraisers;
    }

    function fundraiserCount() external view returns (uint256) {
        return fundraisers.length;
    }

    function isActiveFundraiser(address fundraiser) public view returns (bool) {
        return Fundraising(fundraiser).isActive();
    }
}
