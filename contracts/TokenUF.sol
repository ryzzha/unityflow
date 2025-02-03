// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenUF is ERC20, ERC20Permit, Ownable { 
    constructor(uint256 initialSupply) ERC20("UnityFlow Token", "UF") ERC20Permit("UnityFlow Token") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals()); 
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}