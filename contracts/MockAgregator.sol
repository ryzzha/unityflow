// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockPriceFeed {
    int private price;

    constructor(int _initialPrice) {
        price = _initialPrice;
    }

    function setPrice(int _price) public {
        price = _price;
    }

    function latestRoundData()
        external
        view
        returns (
            uint80,
            int,
            uint256,
            uint256,
            uint80
        )
    {
        return (0, price, block.timestamp, block.timestamp, 0);
    }
}
