// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILatamPayGateway {
    struct Payment {
        address merchant;
        address token;
        uint96 amount;
        bool completed;
        uint64 createdAt;
        uint64 expiresAt;
    }

    event PaymentCreated(bytes32 indexed paymentId, address indexed merchant, address indexed token, uint256 amount, uint256 timestamp);
    event PaymentCompleted(bytes32 indexed paymentId, address indexed payer, address indexed merchant, uint256 amountPaid, uint256 feeCollected, uint256 timestamp);
    event PaymentCancelled(bytes32 indexed paymentId, address indexed merchant, uint256 timestamp);

    function createPayment(bytes32 paymentId, address merchant, address token, uint256 amount, uint256 expiresAt) external;

    function pay(bytes32 paymentId) external;

    function cancelPayment(bytes32 paymentId) external;

    function isTokenSupported(address token) external view returns (bool);
}

