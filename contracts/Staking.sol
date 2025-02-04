// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is Ownable {
    IERC20 public token;
    uint256 public constant REWARD_RATE = 10; // 10% річних

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 duration;
        bool active;
    }

    mapping(address => Stake) public stakes;

    event Staked(address indexed user, uint256 amount, uint256 duration);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    constructor(address tokenAddress) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Invalid token address");
        token = IERC20(tokenAddress);
    }

    function stake(uint256 amount, uint256 duration) external {
        require(amount > 0, "Amount must be greater than zero");
        require(stakes[msg.sender].active == false, "Already staking");
        require(duration >= 30 days, "Minimum staking duration is 30 days");

        token.transferFrom(msg.sender, address(this), amount);

        stakes[msg.sender] = Stake({
            amount: amount,
            startTime: block.timestamp,
            duration: duration,
            active: true
        });

        emit Staked(msg.sender, amount, duration);
    }

    function unstake() external {
        require(stakes[msg.sender].active == true, "No active stake");
        require(block.timestamp >= stakes[msg.sender].startTime + stakes[msg.sender].duration, "Staking period not over");

        uint256 amount = stakes[msg.sender].amount;
        uint256 reward = calculateRewards(msg.sender);
        delete stakes[msg.sender];

        token.transfer(msg.sender, amount + reward);

        emit Unstaked(msg.sender, amount, reward);
    }

    function calculateRewards(address user) public view returns (uint256) {
        if (!stakes[user].active) {
            return 0;
        }
        uint256 stakingTime = block.timestamp - stakes[user].startTime;
        uint256 annualReward = (stakes[user].amount * REWARD_RATE) / 100;
        return (annualReward * stakingTime) / 365 days;
    }

    function getStakingInfo(address user) external view returns (uint256 amount, uint256 startTime, uint256 duration, uint256 reward, bool active) {
        Stake memory stakeData = stakes[user];
        return (stakeData.amount, stakeData.startTime, stakeData.duration, calculateRewards(user), stakeData.active);
    }
}