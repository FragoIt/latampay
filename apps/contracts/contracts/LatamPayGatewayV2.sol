// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LatamPayGateway
 * @notice Payment gateway for stablecoin payments with EIP-2612 permit support
 * @dev Non-custodial: funds go directly from payer to merchant, no TVL
 */
contract LatamPayGateway is ReentrancyGuard, Pausable, Ownable {
    // Constants
    uint256 public constant BASIS_POINTS_DIVISOR = 10000;
    uint256 public constant DEFAULT_FEE_BASIS_POINTS = 30; // 0.30%
    uint256 public constant MIN_FEE_USD = 25; // $0.25 in 6 decimals = 250000
    
    // State
    address public treasury;
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256) public tokenDecimals;
    mapping(bytes32 => bool) public processedPayments;
    
    // Fee tiers (basis points)
    mapping(uint8 => uint256) public planFees;
    
    // Events
    event PaymentCompleted(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed merchant,
        address token,
        uint256 amountPaid,
        uint256 feeCollected,
        uint256 timestamp,
        uint8 planTier
    );
    
    event TokenAdded(address indexed token, uint256 decimals);
    event TokenRemoved(address indexed token);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event PlanFeeUpdated(uint8 indexed planTier, uint256 feeBasisPoints);
    
    // Errors
    error TokenNotSupported(address token);
    error PaymentAlreadyProcessed(bytes32 paymentId);
    error InvalidAmount();
    error InvalidMerchant();
    error TransferFailed();
    error ZeroAddress();
    
    constructor(address _treasury, address initialOwner) Ownable(initialOwner) {
        if (_treasury == address(0)) revert ZeroAddress();
        treasury = _treasury;
        
        // Initialize plan fees (basis points)
        planFees[0] = 35; // FREE: 0.35%
        planFees[1] = 30; // PRO: 0.30%
        planFees[2] = 25; // GROWTH: 0.25%
        planFees[3] = 20; // SCALE: 0.20%
        planFees[4] = 15; // ENTERPRISE: 0.15%
    }
    
    /**
     * @notice Pay with EIP-2612 permit (one transaction)
     * @param paymentId Unique payment identifier
     * @param merchant Recipient address
     * @param amount Payment amount (excluding fee)
     * @param token Token address (USDC/USDT)
     * @param planTier User's plan tier (0-4)
     * @param deadline Permit deadline
     * @param v,r,s Permit signature components
     */
    function payWithPermit(
        bytes32 paymentId,
        address merchant,
        uint256 amount,
        address token,
        uint8 planTier,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant whenNotPaused {
        // Validations
        if (!supportedTokens[token]) revert TokenNotSupported(token);
        if (processedPayments[paymentId]) revert PaymentAlreadyProcessed(paymentId);
        if (merchant == address(0)) revert InvalidMerchant();
        if (amount == 0) revert InvalidAmount();
        
        // Calculate fee
        (uint256 fee, uint256 total) = calculateFee(amount, planTier, token);
        
        // Execute permit
        IERC20Permit(token).permit(
            msg.sender,
            address(this),
            total,
            deadline,
            v,
            r,
            s
        );
        
        // Mark as processed BEFORE transfers (CEI pattern)
        processedPayments[paymentId] = true;
        
        // Transfer amount to merchant
        bool success = IERC20(token).transferFrom(msg.sender, merchant, amount);
        if (!success) revert TransferFailed();
        
        // Transfer fee to treasury
        if (fee > 0) {
            success = IERC20(token).transferFrom(msg.sender, treasury, fee);
            if (!success) revert TransferFailed();
        }
        
        emit PaymentCompleted(
            paymentId,
            msg.sender,
            merchant,
            token,
            amount,
            fee,
            block.timestamp,
            planTier
        );
    }
    
    /**
     * @notice Pay with pre-approved tokens (fallback for tokens without permit)
     * @param paymentId Unique payment identifier
     * @param merchant Recipient address
     * @param amount Payment amount (excluding fee)
     * @param token Token address
     * @param planTier User's plan tier
     */
    function pay(
        bytes32 paymentId,
        address merchant,
        uint256 amount,
        address token,
        uint8 planTier
    ) external nonReentrant whenNotPaused {
        // Validations
        if (!supportedTokens[token]) revert TokenNotSupported(token);
        if (processedPayments[paymentId]) revert PaymentAlreadyProcessed(paymentId);
        if (merchant == address(0)) revert InvalidMerchant();
        if (amount == 0) revert InvalidAmount();
        
        // Calculate fee
        (uint256 fee, uint256 total) = calculateFee(amount, planTier, token);
        
        // Check allowance
        uint256 allowance = IERC20(token).allowance(msg.sender, address(this));
        require(allowance >= total, "Insufficient allowance");
        
        // Mark as processed
        processedPayments[paymentId] = true;
        
        // Transfer amount to merchant
        bool success = IERC20(token).transferFrom(msg.sender, merchant, amount);
        if (!success) revert TransferFailed();
        
        // Transfer fee to treasury
        if (fee > 0) {
            success = IERC20(token).transferFrom(msg.sender, treasury, fee);
            if (!success) revert TransferFailed();
        }
        
        emit PaymentCompleted(
            paymentId,
            msg.sender,
            merchant,
            token,
            amount,
            fee,
            block.timestamp,
            planTier
        );
    }
    
    /**
     * @notice Calculate fee based on plan tier
     * @param amount Payment amount
     * @param planTier Plan tier (0-4)
     * @param token Token address (for decimals)
     * @return fee Fee amount
     * @return total Total amount (amount + fee)
     */
    function calculateFee(
        uint256 amount,
        uint8 planTier,
        address token
    ) public view returns (uint256 fee, uint256 total) {
        require(planTier <= 4, "Invalid plan tier");
        
        // Calculate percentage fee
        uint256 percentageFee = (amount * planFees[planTier]) / BASIS_POINTS_DIVISOR;
        
        // Get minimum fee based on token decimals
        uint256 minFee = MIN_FEE_USD * (10 ** (tokenDecimals[token] - 2));
        
        // Use the greater of percentage or minimum
        fee = percentageFee > minFee ? percentageFee : minFee;
        
        // Don't apply min fee for enterprise (plan 4)
        if (planTier == 4 && percentageFee < minFee) {
            fee = percentageFee;
        }
        
        total = amount + fee;
    }
    
    /**
     * @notice Check if payment was processed
     */
    function isPaymentProcessed(bytes32 paymentId) external view returns (bool) {
        return processedPayments[paymentId];
    }
    
    // Admin functions
    
    function addToken(address token, uint256 decimals) external onlyOwner {
        require(token != address(0), "Zero address");
        require(decimals > 0 && decimals <= 18, "Invalid decimals");
        
        supportedTokens[token] = true;
        tokenDecimals[token] = decimals;
        
        emit TokenAdded(token, decimals);
    }
    
    function removeToken(address token) external onlyOwner {
        supportedTokens[token] = false;
        delete tokenDecimals[token];
        
        emit TokenRemoved(token);
    }
    
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Zero address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }
    
    function setPlanFee(uint8 planTier, uint256 feeBasisPoints) external onlyOwner {
        require(planTier <= 4, "Invalid plan tier");
        require(feeBasisPoints <= 1000, "Fee too high"); // Max 10%
        
        planFees[planTier] = feeBasisPoints;
        
        emit PlanFeeUpdated(planTier, feeBasisPoints);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
