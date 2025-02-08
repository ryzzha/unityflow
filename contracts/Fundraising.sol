// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./UnityFlow.sol";
import "./TokenUF.sol";
import "./Company.sol";

struct FundraisingParams {
    uint id;
    address company;
    string title;
    string description;
    string image;
    string category;
    uint goalUSD;
    uint deadline;
    TokenUF token;
    uint platformFeePercent;
}

contract Fundraising is Ownable {
    UnityFlow public unityFlow;
    TokenUF public token;
    AggregatorV3Interface internal ethPriceFeed;
    AggregatorV3Interface internal tokenPriceFeed;
    Company public company;
    uint id;
    string title;
    string description;
    string image;
    string category;
    uint goalUSD;
    uint deadline;
    uint collectedETH;
    uint collectedUF;
    bool claimed;
    mapping(address => uint) public ethDonators;
    mapping(address => uint) public ufDonators;
    uint public platformFeePercent;

    constructor(
        FundraisingParams memory params, 
        address _ethPriceFeed,
        address _tokenPriceFeed
    ) Ownable(params.company) {
        id = params.id;
        company = Company(payable(params.company));
        title = params.title;
        description = params.description;
        image = params.image;
        category = params.category;
        goalUSD = params.goalUSD;
        deadline = params.deadline;
        token = params.token;
        platformFeePercent = params.platformFeePercent;

        collectedETH = 0;
        collectedUF = 0;
        claimed = false;

        ethPriceFeed = AggregatorV3Interface(_ethPriceFeed);
        tokenPriceFeed = AggregatorV3Interface(_tokenPriceFeed);
    }


    event DonationReceived(address indexed donator, uint amount, string currency);
    event Withdrawn(address sender, uint[2] amounts, string[2] currencies);
    event RefundProcessed(address indexed donator, uint amount, string currency);

    modifier notEnds() {
        require(block.timestamp < deadline, "Campaign ended.");
        _;
    }

    modifier Ends() {
        require(block.timestamp > deadline, "Campaign is still active.");
        _;
    }

    function getDetails() external view returns (
        uint, address, string memory, string memory, string memory, string memory, uint, uint, uint, uint, bool
    ) {
        return (id, address(company), title, description, image, category, goalUSD, deadline, collectedETH, collectedUF, claimed);
    }
 
    function donateETH() external payable notEnds {
        require(msg.value > 0, "Donation must be greater than 0.");

        collectedETH += msg.value;
        ethDonators[msg.sender] += msg.value;

        emit DonationReceived(msg.sender, msg.value, "ETH");
    }

    function donateUF(uint _amount, uint _deadline, uint8 v, bytes32 r, bytes32 s) external payable notEnds {
        require(token.balanceOf(msg.sender) > _amount, "Donation must be greater than sender balance.");

        token.permit(msg.sender, address(this), _amount, _deadline, v, r, s);

        token.transferFrom(msg.sender, address(this), _amount);

        collectedUF += _amount;
        ufDonators[msg.sender] += _amount;

        emit DonationReceived(msg.sender, _amount, "UF");
    }

    function withdrawFunds() external onlyOwner Ends {
        require(!claimed, "Funds already claimed.");

        uint feeETH = (collectedETH * platformFeePercent) / 100;
        uint feeUF = (collectedUF * platformFeePercent) / 100;
        uint amountETHToWithdraw = collectedETH - feeETH;
        uint amountUFToWithdraw = collectedUF - feeUF;

        claimed = true;

        if (feeETH > 0) {
            (bool sentETH, ) = address(unityFlow).call{value: feeETH}("");
            require(sentETH, "Failed to send platform fee in ETH");
        }
        if (feeUF > 0) {
            token.transfer(address(unityFlow), feeUF);
        }

        if (amountETHToWithdraw > 0) {
            company.receiveETH{value: amountETHToWithdraw}();
        }
        if (amountUFToWithdraw > 0) {
            company.receiveUF(amountUFToWithdraw);
        }

        company.onFundraiserCompleted(collectedETH, collectedUF);

        collectedETH = 0;
        collectedUF = 0;

        unityFlow.updateDonations(amountETHToWithdraw, "ETH");
        unityFlow.updateDonations(amountUFToWithdraw, "UF");

        uint[2] memory amounts;
        string[2] memory currencies;

        amounts[0] = amountETHToWithdraw;
        amounts[1] = amountUFToWithdraw;

        currencies[0] = "ETH";
        currencies[1] = "UF";

        emit Withdrawn(msg.sender, amounts, currencies);
    }

    function refundETH() external Ends {
        require(!checkGoalReached(), "Goal reached.");
        
        uint amount = ethDonators[msg.sender];
        require(amount > 0, "No donations to refund.");

        ethDonators[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function refundUF() external Ends {
        require(!checkGoalReached(), "Goal reached.");
        
        uint amount = ufDonators[msg.sender];
        require(amount > 0, "No donations to refund.");

        ufDonators[msg.sender] = 0;
        token.transfer(msg.sender, amount);
    }

    function getDonationETH(address donator) external view returns (uint) {
        return ethDonators[donator];
    }
    function getDonationUF(address donator) external view returns (uint) {
        return ufDonators[donator];
    }

    function getLatestETHPrice() public view returns (uint) {
        (, int price, , , ) = ethPriceFeed.latestRoundData();
        return uint(price) * 1e10; 
    }

    function getLatestTokenPrice() public view returns (uint) {
        (, int price, , , ) = tokenPriceFeed.latestRoundData();
        return uint(price) * 1e10;
    }

    function checkGoalReached() public view returns (bool) {
        uint ethInUSD = (collectedETH * getLatestETHPrice()) / 1e18;
        uint tokenInUSD = (collectedUF * getLatestTokenPrice()) / 1e18;
        return (ethInUSD + tokenInUSD) >= goalUSD;
    }
}