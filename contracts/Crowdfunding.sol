// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TokenUF.sol";

contract Crowdfunding is Ownable {
    address public dao;
    TokenUF public token;
    uint256 public numberOfCampaigns = 0;

    struct FundraisingCampaign {
        address campaignAddress;
        bool claimed;
    }

    mapping(uint => FundraisingCampaign) public campaigns;
    uint public constant MAX_DURATION = 30 days;
    uint public constant MIN_GOAL = 1 ether;
    uint public constant MAX_GOAL = 1000 ether;
    uint public PLATFORM_FEE_PERCENT = 5;

    constructor(address tokenAddress, address daoAddress) Ownable(daoAddress) {
        token = TokenUF(tokenAddress);
        dao = daoAddress;
    }

    event CampaignStarted(uint id, address campaign, address organizer, uint goal, uint deadline);

    function createCampaign(
        string memory title,
        string memory description,
        string memory category,
        uint goal,
        uint deadline,
        string memory image
    ) public {
        require(deadline > block.timestamp && deadline < block.timestamp + MAX_DURATION, "Invalid deadline.");
        require(goal >= MIN_GOAL && goal <= MAX_GOAL, "Goal out of range.");

        Campaign newCampaign = new Campaign(numberOfCampaigns, msg.sender, title, description, image, category, goal, deadline, token, PLATFORM_FEE_PERCENT);

        campaigns[numberOfCampaigns] = FundraisingCampaign({
            campaignAddress: address(newCampaign),
            claimed: false
        });

        emit CampaignStarted(numberOfCampaigns, address(newCampaign), msg.sender, goal, deadline);
        numberOfCampaigns++;
    }

    function getAllCampaigns() external view returns (address[] memory) {
        address[] memory addresses = new address[](numberOfCampaigns);
        for (uint i = 0; i < numberOfCampaigns; i++) {
            addresses[i] = campaigns[i].campaignAddress;
        }
        return addresses;
    }

    function getCampaignAddress(uint campaignId) external view returns (address) {
         require(campaignId < numberOfCampaigns, "Campaign does not exist");
        return campaigns[campaignId].campaignAddress;
    }
}


contract Campaign is Ownable {
    Crowdfunding public parent;
    TokenUF public token;
    uint id;
    address organizer;
    string title;
    string description;
    string image;
    string category;
    uint goal;
    uint deadline;
    uint collectedETH;
    uint collectedUF;
    bool claimed;
    mapping(address => uint) public ethDonators;
    mapping(address => uint) public tokenDonators;
    bool public allowOtherTokens;
    mapping(address => bool) public supportedTokens;
    uint public platformFeePercent;

    constructor(
        uint _id,
        address _organizer,
        string memory _title,
        string memory _description,
        string memory _image,
        string memory _category,
        uint _goal,
        uint _deadline,
        TokenUF _tokenAddress,
        uint _fee
    ) Ownable(_organizer) {
        parent = Crowdfunding(msg.sender);

        id = _id;
        organizer = _organizer;
        title = _title;
        description = _description;
        image = _image;
        category = _category;
        goal = _goal;
        deadline = _deadline;
        token = _tokenAddress;
        platformFeePercent = _fee;

        collectedETH = 0;
        collectedUF = 0;
        claimed = false;
    }

    event DonationReceived(address indexed donator, uint amount, string currency);
    event Withdrawed(address sender, uint amount, uint time);

    function getDetails() external view returns (
        uint, address, string memory, string memory, string memory, string memory, uint, uint, uint, uint, bool
    ) {
        return (id, organizer, title, description, image, category, goal, deadline, collectedETH, collectedUF, claimed);
    }

    function addSupportedToken(address _token) external onlyOwner {
        require(allowOtherTokens, "Adding tokens is not allowed.");
        supportedTokens[_token] = true;
    }

    function donateETH() external payable {
        require(block.timestamp < deadline, "Campaign ended.");
        require(msg.value > 0, "Donation must be greater than 0.");

        collectedETH += msg.value;
        ethDonators[msg.sender] += msg.value;

        emit DonationReceived(msg.sender, msg.value, "ETH");
    }

    function donateUF(uint _amount, uint _deadline, uint8 v, bytes32 r, bytes32 s) external payable {
        require(block.timestamp < deadline, "Campaign ended.");
        require(token.balanceOf(msg.sender) > _amount, "Donation must be greater than sender balance.");

        token.permit(msg.sender, address(this), _amount, _deadline, v, r, s);

        token.transferFrom(msg.sender, address(this), _amount);

        collectedUF += _amount;
        tokenDonators[msg.sender] += _amount;

        emit DonationReceived(msg.sender, msg.value, "UF");
    }

    function withdrawFunds() external onlyOwner {
        require(block.timestamp > deadline, "Campaign is still active.");
        require(!claimed, "Funds already claimed.");

        uint fee = (collectedETH * platformFeePercent) / 100;
        uint amountToWithdraw = collectedETH - fee;

        payable(address(parent)).transfer(fee);
        payable(organizer).transfer(amountToWithdraw);

        claimed = true;
        emit Withdrawed(msg.sender, amountToWithdraw, block.timestamp);
    }

    function refundETH() external {
        require(block.timestamp > deadline, "Campaign is still active.");
        require(collectedETH < goal, "Goal reached, no refunds.");
        
        uint amount = ethDonators[msg.sender];
        require(amount > 0, "No donations to refund.");

        ethDonators[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function getDonationETH(address donator) external view returns (uint) {
        return ethDonators[donator];
    }
    function getDonationUF(address donator) external view returns (uint) {
        return tokenDonators[donator];
    }
}