// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

abstract contract UnityNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;
    string private baseURI;

    event NFTMinted(address indexed recipient, uint256 tokenId, string tokenURI);

    constructor(string memory name, string memory symbol, string memory _baseURI) ERC721(name, symbol) {
        baseURI = _baseURI;
    }

    function mintNFT(address recipient, string memory tokenURI) public onlyOwner {
        uint256 newTokenId = _tokenIdCounter;
        _mint(recipient, newTokenId);
        _tokenIdCounter++;

        emit NFTMinted(recipient, newTokenId, tokenURI);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
}
