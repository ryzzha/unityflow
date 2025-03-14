// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract UnityNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;
    string private baseURI;
    mapping(address => bool) private allowedMinters;

    event NFTMinted(address indexed recipient, uint256 tokenId, string tokenURI);
    event BaseURIUpdated(string newBaseURI);
    event MinterAdded(address minter);
    event MinterRemoved(address minter);

    constructor(string memory name, string memory symbol, string memory _baseURI) ERC721(name, symbol) Ownable(msg.sender) {
        baseURI = _baseURI;
    }

    modifier onlyOwnerOrCompany() {
        require(owner() == msg.sender || allowedMinters[msg.sender], "Not authorized");
        _;
    }

    function mintNFT(address recipient) public onlyOwnerOrCompany {
        uint256 newTokenId = _tokenIdCounter;
        _safeMint(recipient, newTokenId);
        _tokenIdCounter++;

        emit NFTMinted(recipient, newTokenId, tokenURI(newTokenId));
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
        emit BaseURIUpdated(_newBaseURI);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));
    }

    function addMinter(address minter) public onlyOwner {
        allowedMinters[minter] = true;
        emit MinterAdded(minter);
    }

    function removeMinter(address minter) public onlyOwner {
        allowedMinters[minter] = false;
        emit MinterRemoved(minter);
    }
}
