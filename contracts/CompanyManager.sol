// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Company.sol";
import "./UnityFlow.sol";
import "./TokenUF.sol";

contract CompanyManager {
    UnityFlow public unityFlow;
    TokenUF public token;
    uint256 public companyCount;
    
    mapping(uint256 => address) public companies;
    mapping(address => bool) public isCompanyActive;
    mapping(address => address[]) public userToCompanies;

    uint256 public minTokenBalance = 100 * 10**18;

    event CompanyRegistered(uint256 id, address contractAddress, address founder);
    event CompanyClosed(uint256 id, address contractAddress, address founder);

    constructor(address tokenAddress) {
        unityFlow = UnityFlow(msg.sender);
        token = TokenUF(tokenAddress);
    }

    modifier hasMinimumTokens(address user) {
        require(token.balanceOf(user) >= minTokenBalance, "Insufficient token balance to create a company");
        _;
    }

    function registerCompany(
        string memory name, 
        string memory image, 
        string memory description, 
        string memory category, 
        address[] memory cofounders,
        address sender
    ) external hasMinimumTokens(sender) {
        require(bytes(name).length > 0, "Company name cannot be empty");
        require(bytes(image).length > 0, "Company image cannot be empty");
        require(bytes(description).length > 0, "Company description cannot be empty");

        companyCount++;
        Company newCompany = new Company(companyCount, name, image, description, category, sender, cofounders, address(unityFlow), address(token));

        address companyAddress = address(newCompany);
        companies[companyCount] = companyAddress;
        isCompanyActive[companyAddress] = true;

        addCompanyToUser(msg.sender, companyAddress);
        for (uint i = 0; i < cofounders.length; i++) {
            addCompanyToUser(cofounders[i], companyAddress);
        }

        emit CompanyRegistered(companyCount, companyAddress, sender);
    }

    function closeCompany(uint256 companyId, address sender) external {
        address payable companyAddress = payable(companies[companyId]);

        require(companyAddress != address(0), "Company does not exist");
        require(isCompanyActive[companyAddress], "Company is already closed");
        require(sender == companyAddress || sender == Company(companyAddress).founder(), "Not authorized");

        isCompanyActive[companyAddress] = false;

        removeCompanyFromUser(Company(companyAddress).founder(), companyAddress);

        address[] memory cofounders = Company(companyAddress).getCofounders();
        for (uint i = 0; i < cofounders.length; i++) {
            removeCompanyFromUser(cofounders[i], companyAddress);
        }

        emit CompanyClosed(companyId, companyAddress, msg.sender);
    }

    function addCompanyToUser(address user, address company) public {
        userToCompanies[user].push(company);
    }

    function removeCompanyFromUser(address user, address company) public {
        uint length = userToCompanies[user].length;
        for (uint i = 0; i < length; i++) {
            if (userToCompanies[user][i] == company) {
                userToCompanies[user][i] = userToCompanies[user][length - 1];
                userToCompanies[user].pop();
                break;
            }
        }
    }

    function isActiveCompany(address company) external view returns(bool) {
        return isCompanyActive[company];
    }

    function getCompanyAddress(uint companyId) external view returns(address) {
        return companies[companyId];
    }
}
