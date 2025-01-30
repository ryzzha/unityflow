// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
    address public dao;
    uint256 public numberOfCampaigns = 0;
    struct FundraisingCampaign {
        Campaign targetContract;
        bool claimed;
    }
    mapping(uint => FundraisingCampaign) compaings;
    uint MAX_DURATION = 30 days;
    uint MIN_GOAL = 1 ether;
    uint MAX_GOAL = 1000 ether;

    constructor() {
        dao = msg.sender;
    }

    event CompaignStarted(uint id, address campaign, address orginazer, uint goal, uint deadline);

    function createCampaign(string memory title, string memory description, string memory category, uint goal, uint deadline, string memory image) public {
        require(deadline > block.timestamp && deadline < block.timestamp + MAX_DURATION, "The deadline should be a date in the future.");
        require(goal > MIN_GOAL && goal < MAX_GOAL, "The deadline should be a date in the future.");

        Campaign newCampaign = new Campaign(numberOfCampaigns, msg.sender, title, description, image, category, goal, deadline);

        compaings[numberOfCampaigns] = FundraisingCampaign({
            targetContract: newCampaign,
            claimed: false
        });

        emit CompaignStarted(numberOfCampaigns, address(newCampaign), msg.sender, goal, deadline);

        numberOfCampaigns++;
    }

    function getAllCampaigns() external view returns (address[] memory) {
        address[] memory addresses = new address[](numberOfCampaigns);
        for (uint i = 0; i < numberOfCampaigns; i++) {
            addresses[i] = address(compaings[i].targetContract);
        }
        return addresses;
    }
}

contract Campaign {
    Crowdfunding public parent;
    uint id;
    address organizer;
    string title;
    string description;
    string image;
    string category;
    uint goal;
    uint deadline;
    uint collected;
    bool claimed;
    mapping(address => uint) donators;

    constructor(
        uint _id,
        address _organizer,
        string memory _title,
        string memory _description,
        string memory _image,
        string memory _category,
        uint _goal,
        uint _deadline
    ) {
        parent = Crowdfunding(msg.sender);

        id = _id;
        organizer = _organizer;
        title = _title;
        description = _description;
        image = _image;
        category = _category;
        goal = _goal;
        deadline = _deadline;

        collected = 0;
        claimed = false;
    }

    event DonationReceived(address donator, uint amount);
    event Withdrawed(address sender, uint amount, uint time);

    function getDetails() external view returns (
        uint, address, string memory, string memory, string memory, string memory, uint, uint, uint, bool
    ) {
        return (id, organizer, title, description, image, category, goal, deadline, collected, claimed);
    }

    function donate() external payable {
        require(block.timestamp < deadline, "Campaign ended.");
        require(msg.value > 0, "Donation must be greater than 0.");

        collected += msg.value;
        donators[msg.sender] += msg.value;

        emit DonationReceived(msg.sender, msg.value);
    }

    function getDonation(address donator) external view returns (uint) {
        return donators[donator];
    }
}