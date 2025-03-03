// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ufNFT.sol";

contract UnityNFTFactory {
    mapping(address => address[]) public userNFTs;
    address[] public allNFTContracts;

    event NFTCollectionCreated(address indexed owner, address nftContract);

    function createNFTCollection(string memory name, string memory symbol) external {
        UnityNFT nft = new UnityNFT(name, symbol);
        nft.transferOwnership(msg.sender);
        userNFTs[msg.sender].push(address(nft));
        allNFTContracts.push(address(nft));

        emit NFTCollectionCreated(msg.sender, address(nft));
    }

    function getUserNFTCollections(address user) external view returns (address[] memory) {
        return userNFTs[user];
    }

    function getAllNFTCollections() external view returns (address[] memory) {
        return allNFTContracts;
    }
}
