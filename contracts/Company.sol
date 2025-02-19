// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./UnityFlow.sol";
import "./TokenUF.sol";

contract Company is Ownable {
    UnityFlow public unityFlow;
    TokenUF public token;

    uint public id;
    string public image;
    string public name;
    string public description;
    string public category;

    address public founder;
    address[] public cofounders;

    uint256 public totalFundsETH;
    uint256 public totalFundsUF;
    address[] public fundraisers;

    uint256 public totalInvestmentsETH;
    uint256 public totalInvestmentsUF;

    address[] public investors;
    mapping(address => uint256) public investorETHBalances;
    mapping(address => uint256) public investorUFBalances;

    uint public fundraisingCount;

    bool closed;

    struct CompanyDetails {
        uint companyId;
        address companyAddress;
        string name;
        string image;
        string description;
        string category;
        address founder;
        address[] cofounders;
        uint256 totalFundsETH;
        uint256 totalFundsUF;
        uint256 totalInvestmentsETH;
        uint256 totalInvestmentsUF;
        address[] fundraisers;
        address[] investors;
        bool isActive;
    }

    uint256 public lastDividendDistribution;

    mapping(address => uint256) public pendingDividendsETH;
    mapping(address => uint256) public pendingDividendsUF;

    event CofounderAdded(address cofounder);
    event CofounderRemoved(address cofounder);

    event FundraiserCreated(address indexed company, address fundraiser, string title, uint goalUSD, uint deadline);
    event FundraiserSuccessfullyCompleted(address indexed company, address fundraiser, uint collectedETH, uint collectedUF);
    event FundraiserUnsuccessfulEnded(address indexed company, address fundraiser, uint collectedETH, uint collectedUF);

    event FundsReceived(uint256 amount, address sender, string asset, string source);
    event FundsWithdrawn(uint256 amount, address receiver, string asset, string source);

    modifier onlyFounderOrCofounder() {
        require(msg.sender == founder || _isCofounder(msg.sender), "Not authorized");
        _;
    }

    constructor(uint _id, string memory _name, string memory _image, string memory _description, string memory _category, address _founder, address[] memory _cofounders, address _unityFlow, address _token) Ownable(_founder) {
        require(_founder != address(0), "Invalid founder address");
        require(_unityFlow != address(0), "Invalid UnityFlow address");
        require(_token != address(0), "Invalid TokenUF address");
        
        id = _id;
        image = _image;
        name = _name;
        description = _description;
        category = _category;
        founder = _founder;
        cofounders = _cofounders;
        unityFlow = UnityFlow(_unityFlow);
        token = TokenUF(_token);
    }

    receive() external payable {
        receiveETH();
    }

    function receiveETH() public payable {
        require(msg.value > 0, "Must send some funds");
        totalFundsETH += msg.value;
        unityFlow.updateDonations(msg.value, "ETH");
        emit FundsReceived(msg.value, msg.sender, "ETH", "donation");
    }

    function receiveUF(uint256 amount) external {
        require(amount > 0, "Must send some funds");
        require(token.balanceOf(msg.sender) >= amount, "Insufficient token balance");

        token.transferFrom(msg.sender, address(this), amount);
        totalFundsUF += amount;

        unityFlow.updateDonations(amount, "UF");
        
        emit FundsReceived(amount, msg.sender, "UF", "donation");
    }

    function withdrawETH(address to, uint amount) public onlyOwner {
        require(amount > 0 && amount <= totalFundsETH, "Invalid withdraw amount");
        totalFundsETH -= amount;
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Failed to send funds.");
        emit FundsWithdrawn(amount, to, "ETH", "company");
    }

    function withdrawUF(address to, uint amount) public onlyOwner {
        require(amount > 0 && amount <= totalFundsUF, "Invalid withdraw amount");
        require(token.balanceOf(address(this)) >= amount, "not enougth tokens");
        totalFundsUF -= amount;
        token.transfer(to, amount);
        emit FundsWithdrawn(amount, to, "UF", "company");
    }

    function fullWithdraw(address to) external onlyOwner {
        require(address(this).balance > 0 || token.balanceOf(address(this)) > 0, "No funds to withdraw");

        if (address(this).balance > 0) {
            withdrawETH(to, address(this).balance - 1);
        }
        if (token.balanceOf(address(this)) > 0) {
            withdrawUF(to, token.balanceOf(address(this)));
        }
    }

    function withdrawFromFundraising(address fundraisingContract) external onlyOwner {
        Fundraising(fundraisingContract).withdrawFunds();
    }

    function createFundraising(
        string memory title,
        string memory _description,
        string memory _category,
        uint goalUSD,
        uint deadline,
        string memory _image
    ) external onlyFounderOrCofounder {
        fundraisingCount++;
        address newFundraiser = unityFlow.createFundraising(
            fundraisingCount, title, _description, _category, goalUSD, deadline, _image
        );
        fundraisers.push(newFundraiser);
        emit FundraiserCreated(address(this), address(newFundraiser), title, goalUSD, deadline);
    }

    function onFundraiserSuccessfullyCompleted(uint totalCollectedETH, uint totalCollectedUF) external {
        require(_isFundraiser(msg.sender), "Caller is not a fundraiser");
        fundraisingCount--;
        emit FundraiserSuccessfullyCompleted(address(this), msg.sender, totalCollectedETH, totalCollectedUF);
    }

    function onFundraiserUnsuccessfulEnded(uint totalCollectedETH, uint totalCollectedUF) external {
        require(_isFundraiser(msg.sender), "Caller is not a fundraiser");
        fundraisingCount--;
        emit FundraiserUnsuccessfulEnded(address(this), msg.sender, totalCollectedETH, totalCollectedUF);
    }

    function investETH() external payable {
        require(msg.value > 0, "Investment must be greater than 0");

        if (investorETHBalances[msg.sender] == 0 && investorUFBalances[msg.sender] == 0) {
            investors.push(msg.sender);
        }
        
        investorETHBalances[msg.sender] += msg.value;
        totalInvestmentsETH += msg.value;

        unityFlow.increaseInvestments(msg.value, "ETH");
        emit FundsReceived(msg.value, msg.sender, "ETH", "investment_received");
    }

    function investUF(uint256 amount) external {
        require(amount > 0, "Investment must be greater than 0");
        require(token.balanceOf(msg.sender) >= amount, "Insufficient token balance");

        if (investorETHBalances[msg.sender] == 0 && investorUFBalances[msg.sender] == 0) {
            investors.push(msg.sender);
        }

        token.transferFrom(msg.sender, address(this), amount);
        require(token.balanceOf(address(this)) >= totalFundsUF + amount, "Transfer failed");

        investorUFBalances[msg.sender] += amount;
        totalInvestmentsUF += amount;

        unityFlow.increaseInvestments(amount, "UF");
        emit FundsReceived(amount, msg.sender, "ETH", "investment_received");
    }

    function withdrawInvestmentETH(uint256 amount) external {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(investorETHBalances[msg.sender] >= amount, "Insufficient investment balance");

        investorETHBalances[msg.sender] -= amount;
        totalInvestmentsETH -= amount;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Failed to send ETH");

        if (investorETHBalances[msg.sender] == 0 && investorUFBalances[msg.sender] == 0) {
            removeInvestor(msg.sender);
        }

        unityFlow.decreaseInvestments(amount, "ETH");
        emit FundsWithdrawn(amount, msg.sender, "ETH", "investment_withdraw");
    }

    function withdrawInvestmentUF(uint256 amount) external {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(investorUFBalances[msg.sender] >= amount, "Insufficient investment balance");

        investorUFBalances[msg.sender] -= amount;
        totalInvestmentsUF -= amount;

        token.transfer(msg.sender, amount);
        unityFlow.decreaseInvestments(amount, "UF");

        if (investorETHBalances[msg.sender] == 0 && investorUFBalances[msg.sender] == 0) {
            removeInvestor(msg.sender);
        }

        emit FundsWithdrawn(amount, msg.sender, "UF", "investment_withdraw");
    }

    function distributeDividends() external onlyOwner {
        require(block.timestamp >= lastDividendDistribution + 30 days, "Dividends already distributed this month");
        require(totalFundsETH > 0 || totalFundsUF > 0, "No funds available for dividends");

        uint256 totalDividendsETH = (totalFundsETH * 10) / 100; 
        uint256 totalDividendsUF = (totalFundsUF * 10) / 100;   

        require(totalDividendsETH > 0 || totalDividendsUF > 0, "No dividends to distribute");

        for (uint i = 0; i < investors.length; i++) {
            address investor = investors[i];

            if (totalDividendsETH > 0) {
                uint256 shareETH = (investorETHBalances[investor] * totalDividendsETH) / totalInvestmentsETH;
                if (shareETH > 0) {
                    pendingDividendsETH[investor] += shareETH;
                }
            }

            if (totalDividendsUF > 0) {
                uint256 shareUF = (investorUFBalances[investor] * totalDividendsUF) / totalInvestmentsUF;
                if (shareUF > 0) {
                    pendingDividendsUF[investor] += shareUF;
                }
            }
        }

        lastDividendDistribution = block.timestamp;
    }

    function withdrawDividendsETH() external {
        uint256 amount = pendingDividendsETH[msg.sender];
        require(amount > 0, "No ETH dividends available");
        require(address(this).balance >= amount, "Not enough ETH balance in contract");

        pendingDividendsETH[msg.sender] = 0; 

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Failed to send ETH");

        emit FundsWithdrawn(amount, msg.sender, "ETH", "dividends_withdraw");
    }

    function withdrawDividendsUF() external {
        uint256 amount = pendingDividendsUF[msg.sender];
        require(amount > 0, "No UF dividends available");
        require(token.balanceOf(address(this)) >= amount, "Not enough UF balance in contract");

        pendingDividendsUF[msg.sender] = 0; 

        token.transfer(msg.sender, amount);

        emit FundsWithdrawn(amount, msg.sender, "UF", "dividends_withdraw");
    }

    function removeInvestor(address investor) private {
        uint256 length = investors.length;
        for (uint256 i = 0; i < length; i++) {
            if (investors[i] == investor) {
                investors[i] = investors[length - 1]; 
                investors.pop(); 
                break;
            }
        }
    }

    function addCofounder(address cofounder) external onlyOwner {
        require(cofounder != address(0), "Invalid cofounder address");
        require(!_isCofounder(cofounder), "Already a cofounder");

        unityFlow.addCompanyToUser(cofounder, address(this));

        cofounders.push(cofounder);
        emit CofounderAdded(cofounder);
    }

    function removeCofounder(address cofounder) external onlyOwner {
        require(_isCofounder(cofounder), "Not a cofounder");

        uint length = cofounders.length;
        for (uint i = 0; i < length; i++) {
            if (cofounders[i] == cofounder) {
                cofounders[i] = cofounders[length - 1];
                cofounders.pop();
                break;
            }
        }

        unityFlow.removeCompanyFromUser(cofounder, address(this));
        emit CofounderRemoved(cofounder);
    }

    function getCofounders() external view returns (address[] memory) {
        return cofounders;
    }

    function getCompanyInfo() external view returns (
        uint companyId,
        address companyAddress,
        string memory companyName,
        string memory companyImage,
        string memory companyDescription,
        string memory companyCategory,
        address companyFounder,
        bool isActive
    ) {
        return (id, address(this), name, image, description, category, founder, !closed);
    }

    function getCompanyDetails() external view returns (CompanyDetails memory) {
        return CompanyDetails({
            companyId: id,
            companyAddress: address(this),
            name: name,
            image: image,
            description: description,
            category: category,
            founder: founder,
            cofounders: cofounders,
            totalFundsETH: totalFundsETH,
            totalFundsUF: totalFundsUF,
            totalInvestmentsETH: totalInvestmentsETH,
            totalInvestmentsUF: totalInvestmentsUF,
            fundraisers: fundraisers,
            investors: investors,
            isActive: !closed
        });
    }

    function getInvestorBalance(address investor) external view returns (uint256 ethBalance, uint256 ufBalance) {
        return (investorETHBalances[investor], investorUFBalances[investor]);
    }

    function getInvestorDividends(address investor) external view returns (uint256 ethDividends, uint256 ufDividends) {
        return (pendingDividendsETH[investor], pendingDividendsUF[investor]);
    }

    function _isCofounder(address user) private view returns (bool) {
        for (uint i = 0; i < cofounders.length; i++) {
            if (cofounders[i] == user) {
                return true;
            }
        }
        return false;
    }

    function _isFundraiser(address fundraiser) private view returns (bool) {
        for (uint i = 0; i < fundraisers.length; i++) {
            if (fundraisers[i] == fundraiser) {
                return true;
            }
        }
        return false;
    }

    function closeCompany() external onlyOwner() {
        closed = true;
        unityFlow.closeCompany(id);
    }
}