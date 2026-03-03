// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LatamPayGateway
 * @notice Payment gateway for stablecoin payments with EIP-2612 permit support
 * @dev Non-custodial: funds go directly merchant → no TVL
 */
contract LatamPayGateway is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    struct Payment {
        address merchant;
        address token;
        uint96 amount;
        bool completed;
        uint64 createdAt;
        uint64 expiresAt;
    }

    /// @dev Basis points cobrados como fee (0.3%).
    uint256 public constant FEE_BPS = 30;

    /// @dev Divisor para calcular basis points (100% = 10_000).
    uint256 public constant BPS_DIVISOR = 10_000;

    /// @dev Dirección del token USDC soportado.
    address public immutable usdc;

    /// @dev Dirección del token USDT soportado.
    address public immutable usdt;

    /// @dev Dirección donde se colectan los fees.
    address public treasury;

    /// @dev Tokens soportados por el gateway.
    mapping(address => bool) private _supportedTokens;

    /// @notice Mapeo de identificadores de pago a su información.
    mapping(bytes32 => Payment) public payments;

    /// @notice Emitted when a new payment intent is created.
    event PaymentCreated(bytes32 indexed paymentId, address indexed merchant, address indexed token, uint256 amount, uint256 timestamp);

    /// @notice Emitted when a payment is completed.
    event PaymentCompleted(bytes32 indexed paymentId, address indexed payer, address indexed merchant, uint256 amountPaid, uint256 feeCollected, uint256 timestamp);

    /// @notice Emitted when a payment intent is cancelled.
    event PaymentCancelled(bytes32 indexed paymentId, address indexed merchant, uint256 timestamp);

    /// @notice Emitted when the treasury address changes.
    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);

    /// @dev Custom errors para ahorrar gas en reverts.
    error InvalidAddress();
    error InvalidAmount();
    error InvalidPaymentId();
    error InvalidExpiration();
    error UnsupportedToken(address token);
    error PaymentAlreadyExists(bytes32 paymentId);
    error PaymentNotFound(bytes32 paymentId);
    error PaymentAlreadyCompleted(bytes32 paymentId);
    error PaymentExpired(bytes32 paymentId);
    error UnauthorizedMerchant(bytes32 paymentId, address caller);
    error TreasuryNotSet();

    /**
     * @notice Inicializa el gateway con los tokens soportados y la tesorería.
     * @param usdcAddress Dirección del contrato USDC.
     * @param usdtAddress Dirección del contrato USDT.
     * @param treasuryAddress Dirección que recibirá los fees.
     * @param initialOwner Dirección que tendrá privilegios de owner.
     */
    constructor(address usdcAddress, address usdtAddress, address treasuryAddress, address initialOwner) Ownable(initialOwner) {
        if (usdcAddress == address(0) || usdtAddress == address(0) || treasuryAddress == address(0) || initialOwner == address(0)) {
            revert InvalidAddress();
        }
        if (usdcAddress == usdtAddress) {
            revert UnsupportedToken(usdcAddress);
        }

        usdc = usdcAddress;
        usdt = usdtAddress;
        treasury = treasuryAddress;

        _supportedTokens[usdcAddress] = true;
        _supportedTokens[usdtAddress] = true;
    }

    /**
     * @notice Crea un nuevo intento de pago.
     * @dev Solo el owner (backend) puede registrar intents.
     * @param paymentId Identificador único del pago.
     * @param merchant Dirección del comercio receptor.
     * @param token Stablecoin a utilizar (debe estar soportada).
     * @param amount Monto bruto a cobrar.
     * @param expiresAt Timestamp de expiración (0 = sin expiración).
     */
    function createPayment(
        bytes32 paymentId,
        address merchant,
        address token,
        uint256 amount,
        uint256 expiresAt
    ) external onlyOwner whenNotPaused {
        if (paymentId == bytes32(0)) {
            revert InvalidPaymentId();
        }
        if (merchant == address(0) || token == address(0)) {
            revert InvalidAddress();
        }
        if (!_supportedTokens[token]) {
            revert UnsupportedToken(token);
        }
        if (payments[paymentId].merchant != address(0)) {
            revert PaymentAlreadyExists(paymentId);
        }
        if (amount == 0 || amount > type(uint96).max) {
            revert InvalidAmount();
        }

        uint64 createdAt = uint64(block.timestamp);
        uint64 expires = uint64(expiresAt);
        if (expiresAt != 0 && expiresAt <= block.timestamp) {
            revert InvalidExpiration();
        }

        payments[paymentId] = Payment({
            merchant: merchant,
            token: token,
            amount: uint96(amount),
            completed: false,
            createdAt: createdAt,
            expiresAt: expires
        });

        emit PaymentCreated(paymentId, merchant, token, amount, createdAt);
    }

    /**
     * @notice Ejecuta el pago de un intento previamente creado.
     * @dev Debe existir, no estar completado y contar con allowance del pagador.
     * @param paymentId Identificador del pago a ejecutar.
     * @param deadline Deadline for the permit signature.
     * @param v V component of the permit signature.
     * @param r R component of the permit signature.
     * @param s S component of the permit signature.
     */
    function pay(
        bytes32 paymentId,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external whenNotPaused nonReentrant {
        Payment storage payment = payments[paymentId];
        if (payment.merchant == address(0)) {
            revert PaymentNotFound(paymentId);
        }
        if (payment.completed) {
            revert PaymentAlreadyCompleted(paymentId);
        }
        if (payment.expiresAt != 0 && block.timestamp > payment.expiresAt) {
            revert PaymentExpired(paymentId);
        }
        address merchant = payment.merchant;
        address token = payment.token;

        if (treasury == address(0)) {
            revert TreasuryNotSet();
        }

        payment.completed = true;

        uint256 grossAmount = uint256(payment.amount);
        uint256 feeAmount = (grossAmount * FEE_BPS) / BPS_DIVISOR;
        uint256 netAmount = grossAmount - feeAmount;

        address payer = msg.sender;
        
        // Execute Permit
        try IERC20Permit(token).permit(payer, address(this), grossAmount, deadline, v, r, s) {
            // Permit successful
        } catch {
            // If permit fails, we assume allowance was already set or token doesn't support permit in a standard way
            // But for this specific implementation, we want to enforce Permit usage or at least attempt it.
            // However, to be safe and allow standard approve flow if signature is empty/invalid but allowance exists:
            // We could check allowance. But the requirement is "One-Click Pay", so we prioritize Permit.
            // For now, we will just proceed. If permit failed and no allowance, transferFrom will fail.
        }

        IERC20 erc20 = IERC20(token);

        erc20.safeTransferFrom(payer, treasury, feeAmount);
        erc20.safeTransferFrom(payer, merchant, netAmount);

        emit PaymentCompleted(paymentId, payer, merchant, grossAmount, feeAmount, block.timestamp);
    }

    /**
     * @notice Cancela un intento de pago pendiente.
     * @dev Solo el comercio asignado puede cancelarlo mientras no esté completado.
     * @param paymentId Identificador del pago a cancelar.
     */
    function cancelPayment(bytes32 paymentId) external whenNotPaused {
        Payment storage payment = payments[paymentId];
        if (payment.merchant == address(0)) {
            revert PaymentNotFound(paymentId);
        }
        if (payment.completed) {
            revert PaymentAlreadyCompleted(paymentId);
        }
        if (payment.merchant != msg.sender) {
            revert UnauthorizedMerchant(paymentId, msg.sender);
        }

        address merchant = payment.merchant;
        delete payments[paymentId];

        emit PaymentCancelled(paymentId, merchant, block.timestamp);
    }

    /**
     * @notice Actualiza la dirección de la tesorería.
     * @param newTreasury Nueva dirección que recibirá los fees.
     */
    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) {
            revert InvalidAddress();
        }
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    /**
     * @notice Pausa la ejecución de pagos y creación de intents.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Reanuda la ejecución de pagos y creación de intents.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Devuelve si un token está soportado por el gateway.
     */
    function isTokenSupported(address token) external view returns (bool) {
        return _supportedTokens[token];
    }
}

