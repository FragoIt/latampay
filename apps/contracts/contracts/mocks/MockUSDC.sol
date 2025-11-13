// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    uint8 private immutable _customDecimals;

    constructor(uint256 initialSupply, address recipient) ERC20("Mock USDC", "mUSDC") {
        _customDecimals = 6;
        _mint(recipient, initialSupply);
    }

    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }
}

