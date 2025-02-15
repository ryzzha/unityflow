// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
// import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./MockAgregator.sol";
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
    // AggregatorV3Interface internal ethPriceFeed;
    // AggregatorV3Interface internal tokenPriceFeed;
    MockPriceFeed internal ethPriceFeed;
    MockPriceFeed internal tokenPriceFeed;

    Company public company;
    string companyName;
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
    bool public isActive = true;
    address[] donatorsList;
    mapping(address => uint) public ethDonators;
    mapping(address => uint) public ufDonators;
    uint public platformFeePercent;

    constructor(
        address unityFlowAddress,
        FundraisingParams memory params, 
        address _ethPriceFeed,
        address _tokenPriceFeed
    ) Ownable(params.company) {
        unityFlow = UnityFlow(unityFlowAddress);
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

        // ethPriceFeed = AggregatorV3Interface(_ethPriceFeed);
        // tokenPriceFeed = AggregatorV3Interface(_tokenPriceFeed);

        ethPriceFeed = MockPriceFeed(_ethPriceFeed);
        tokenPriceFeed = MockPriceFeed(_tokenPriceFeed);

        (, , companyName, , , , , ) = company.getCompanyInfo();
    }


    event DonationReceived(address indexed donator, uint amount, string currency);
    event Withdrawn(address sender, uint[2] amounts, string[2] currencies);
    event RefundProcessed(address indexed donator, uint amount, string currency);
    event FundraisingSuccessful(address indexed fundraiser, address indexed company, uint collectedETH, uint collectedUF);
    event FundraisingFailed(address indexed fundraiser, address indexed company, uint collectedETH, uint collectedUF);

    modifier notEnds() {
        require(block.timestamp < deadline, "Fundraising ended.");
        _;
    }

    modifier Ends() {
        require(block.timestamp > deadline, "Fundraising is still active.");
        _;
    }

    function getInfo() external view returns (
        uint, address, string memory, string memory, string memory, string memory, uint, uint, string memory
    ) {
        return (id, address(this), companyName, title, image, category, goalUSD, deadline, getStatus());
    }

    function getDetails() external view returns (
        uint, address, string memory, string memory, string memory, string memory, uint, uint, uint, uint, bool
    ) {
        return (id, address(company), title, description, image, category, goalUSD, deadline, collectedETH, collectedUF, claimed);
    }

    function getStatus() public view returns (string memory) {
        if (block.timestamp < deadline) {
            return "active"; 
        }
        if (checkGoalReached()) {
            return "success"; 
        }
        return "failed"; 
    }
 
    function donateETH() external payable notEnds {
        require(isActive, "Campaign is not active.");
        require(msg.value > 0, "Donation must be greater than 0.");

        if (ethDonators[msg.sender] == 0 && ufDonators[msg.sender] == 0) {
            donatorsList.push(msg.sender);
        }

        collectedETH += msg.value;
        ethDonators[msg.sender] += msg.value;

        emit DonationReceived(msg.sender, msg.value, "ETH");
    }

    function donateUF(uint _amount, uint _deadline, uint8 v, bytes32 r, bytes32 s) external payable notEnds {
        require(token.balanceOf(msg.sender) > _amount, "Donation must be greater than sender balance.");

        if (ethDonators[msg.sender] == 0 && ufDonators[msg.sender] == 0) {
            donatorsList.push(msg.sender);
        }

        token.permit(msg.sender, address(this), _amount, _deadline, v, r, s);

        token.transferFrom(msg.sender, address(this), _amount);

        collectedUF += _amount;
        ufDonators[msg.sender] += _amount;

        emit DonationReceived(msg.sender, _amount, "UF");
    }

    function withdrawFunds() external onlyOwner Ends {
        require(!claimed, "Funds already claimed.");
        require(checkGoalReached(), "Goal not reached. Cannot withdraw.");

        uint feeETH = (collectedETH * platformFeePercent) / 100;
        uint feeUF = (collectedUF * platformFeePercent) / 100;
        uint amountETHToWithdraw = collectedETH - feeETH;
        uint amountUFToWithdraw = collectedUF - feeUF;

        claimed = true;
        isActive = false;

        if (feeETH > 0) {
            UnityFlow(payable(address(unityFlow))).receivePlatformFeeETH{value: feeETH}();
        }
        if (feeUF > 0) {
            token.approve(address(unityFlow), feeUF);
            UnityFlow(address(unityFlow)).receivePlatformFeeUF(feeUF);
        }

        if (amountETHToWithdraw > 0) {
            company.receiveETH{value: amountETHToWithdraw}();
        }
        if (amountUFToWithdraw > 0) {
            token.approve(address(company), amountUFToWithdraw); 
            company.receiveUF(amountUFToWithdraw);
        }

        company.onFundraiserSuccessfullyCompleted(collectedETH, collectedUF);

        uint[2] memory amounts;
        string[2] memory currencies;

        amounts[0] = amountETHToWithdraw;
        amounts[1] = amountUFToWithdraw;

        currencies[0] = "ETH";
        currencies[1] = "UF";

        emit Withdrawn(msg.sender, amounts, currencies);
    }

    function refundETH() external Ends {
        finalizeFundraising();
        require(!checkGoalReached(), "Goal reached.");
        
        uint amount = ethDonators[msg.sender];
        require(amount > 0, "No donations to refund.");

        ethDonators[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function refundUF() external Ends {
        finalizeFundraising();
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

    function getDonators() external view returns (address[] memory, uint[] memory, uint[] memory) {
        uint len = donatorsList.length;
        address[] memory addresses = new address[](len);
        uint[] memory ethAmounts = new uint[](len);
        uint[] memory ufAmounts = new uint[](len);

        for (uint i = 0; i < len; i++) {
            addresses[i] = donatorsList[i];
            ethAmounts[i] = ethDonators[donatorsList[i]];
            ufAmounts[i] = ufDonators[donatorsList[i]];
        }
        return (addresses, ethAmounts, ufAmounts);
    }

    function getDonationsForToken(string memory tokenSymbol) external view returns (address[] memory, uint[] memory) {
        require(keccak256(abi.encodePacked(tokenSymbol)) == keccak256(abi.encodePacked("ETH")) || 
                keccak256(abi.encodePacked(tokenSymbol)) == keccak256(abi.encodePacked("UF")), 
                "Invalid token symbol. Use 'ETH' or 'UF'.");

        uint len = donatorsList.length;
        address[] memory addresses = new address[](len);
        uint[] memory amounts = new uint[](len);

        for (uint i = 0; i < len; i++) {
            addresses[i] = donatorsList[i];

            if (keccak256(abi.encodePacked(tokenSymbol)) == keccak256(abi.encodePacked("ETH"))) {
                amounts[i] = ethDonators[donatorsList[i]];
            } else {
                amounts[i] = ufDonators[donatorsList[i]];
            }
        }
        
        return (addresses, amounts);
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

    function finalizeFundraising() public {
        if (block.timestamp > deadline && isActive) {
            isActive = false;
            company.onFundraiserUnsuccessfulEnded(collectedETH, collectedUF);
            // emit FundraisingEnded(id, address(company), collectedETH, collectedUF);
        }
    }
}