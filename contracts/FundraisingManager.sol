// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Fundraising.sol";
import "./TokenUF.sol";

contract FundraisingManager {
    TokenUF public token;

    mapping(string => uint256) public donationsByCurrency;
    mapping(string => uint256) public investmentsByCurrency;

    constructor(address tokenAddress) {
        token = TokenUF(tokenAddress);
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

        Fundraising newFundraising = new Fundraising(unityFlowAddress, params, address(0), address(0));
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
}
