import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import { Signer, Contract, TypedDataDomain, TypedDataField } from 'ethers';
import { deployGatewayFixture } from './fixtures/deployGateway';

const PLAN_BASIC = 0;
const PLAN_PRO = 1;
const PLAN_ENTERPRISE = 2;

describe('LatamPayGateway', function () {
  let gateway: Contract,
    usdc: Contract,
    usdt: Contract,
    owner: Signer,
    merchant: Signer,
    payer: Signer,
    other: Signer,
    treasury: Signer;

  beforeEach(async function () {
    ({ gateway, usdc, usdt, owner, merchant, payer, other, treasury } = await loadFixture(
      deployGatewayFixture
    ));
  });

  async function signPermit(
    token: Contract,
    signer: Signer,
    spender: string,
    value: bigint,
    deadline: number
  ): Promise<{ v: number; r: string; s: string; deadline: number }> {
    const nonce = await token.nonces(await signer.getAddress());
    const name = await token.name();
    const chainId = (await ethers.provider.getNetwork()).chainId;

    const domain: TypedDataDomain = {
      name,
      version: '1',
      chainId,
      verifyingContract: await token.getAddress(),
    };

    const types: Record<string, Array<TypedDataField>> = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    };

    const message = {
      owner: await signer.getAddress(),
      spender,
      value,
      nonce,
      deadline,
    };

    const signature = await signer.signTypedData(domain, types, message);
    const { v, r, s } = ethers.Signature.from(signature);

    return { v, r, s, deadline };
  }

  describe('Deployment & Configuration', function () {
    it('Should deploy the contract correctly', async function () {
      expect(await gateway.getAddress()).to.be.properAddress;
    });

    it('Should set the owner correctly', async function () {
      expect(await gateway.owner()).to.equal(await owner.getAddress());
    });

    it('Should set the treasury correctly', async function () {
      expect(await gateway.treasury()).to.equal(await treasury.getAddress());
    });

    it('Should revert if treasury is the zero address', async function () {
      const LatamPayGateway = await ethers.getContractFactory('contracts/LatamPayGateway.sol:LatamPayGateway');
      await expect(
        LatamPayGateway.deploy(
          await usdc.getAddress(),
          await usdt.getAddress(),
          ethers.ZeroAddress,
          await owner.getAddress()
        )
      ).to.be.revertedWithCustomError(gateway, 'InvalidAddress');
    });
  });

  describe('createPayment()', function () {
    const paymentId = ethers.id('test-payment-1');
    const amount = ethers.parseUnits('100', 6);

    it('Should create a payment successfully', async function () {
      const expiresAt = (await time.latest()) + 3600;
      
      await expect(
        gateway.connect(owner).createPayment(
          paymentId,
          await merchant.getAddress(),
          await usdc.getAddress(),
          amount,
          expiresAt
        )
      ).to.emit(gateway, 'PaymentCreated');
    });

    it('Should revert if paymentId already exists', async function () {
      const expiresAt = (await time.latest()) + 3600;
      
      await gateway.connect(owner).createPayment(
        paymentId,
        await merchant.getAddress(),
        await usdc.getAddress(),
        amount,
        expiresAt
      );

      await expect(
        gateway.connect(owner).createPayment(
          paymentId,
          await merchant.getAddress(),
          await usdc.getAddress(),
          amount,
          expiresAt
        )
      ).to.be.revertedWithCustomError(gateway, 'PaymentAlreadyExists');
    });
  });

  describe('pay()', function () {
    const paymentId = ethers.id('test-payment-fallback');
    const amount = ethers.parseUnits('200', 6);

    it('Should execute a payment successfully with pre-approval', async function () {
      const expiresAt = (await time.latest()) + 3600;
      const feeAmount = (amount * 30n) / 10000n;
      const netAmount = amount - feeAmount;
      const totalAmount = amount;

      await gateway.connect(owner).createPayment(
        paymentId,
        await merchant.getAddress(),
        await usdc.getAddress(),
        amount,
        expiresAt
      );

      await usdc.connect(payer).approve(await gateway.getAddress(), totalAmount);

      const tx = gateway.connect(payer).pay(paymentId);

      await expect(tx).to.emit(gateway, 'PaymentCompleted');
      
      await expect(tx).to.changeTokenBalances(
        usdc,
        [payer, merchant, treasury],
        [-totalAmount, netAmount, feeAmount]
      );
    });

    it('Should revert if payment not found', async function () {
      const fakePaymentId = ethers.id('fake-payment');
      await expect(
        gateway.connect(payer).pay(fakePaymentId)
      ).to.be.revertedWithCustomError(gateway, 'PaymentNotFound');
    });
  });

  describe('cancelPayment()', function () {
    const paymentId = ethers.id('test-payment-cancel');
    const amount = ethers.parseUnits('150', 6);

    it('Should allow merchant to cancel their payment', async function () {
      const expiresAt = (await time.latest()) + 3600;

      await gateway.connect(owner).createPayment(
        paymentId,
        await merchant.getAddress(),
        await usdc.getAddress(),
        amount,
        expiresAt
      );

      await expect(
        gateway.connect(merchant).cancelPayment(paymentId)
      ).to.emit(gateway, 'PaymentCancelled');
    });

    it('Should revert if non-merchant tries to cancel', async function () {
      const expiresAt = (await time.latest()) + 3600;

      await gateway.connect(owner).createPayment(
        paymentId,
        await merchant.getAddress(),
        await usdc.getAddress(),
        amount,
        expiresAt
      );

      await expect(
        gateway.connect(other).cancelPayment(paymentId)
      ).to.be.revertedWithCustomError(gateway, 'UnauthorizedMerchant');
    });
  });

  describe('Admin & Owner Functions', function () {
    it('Should allow owner to pause and unpause the contract', async function () {
      await gateway.connect(owner).pause();
      expect(await gateway.paused()).to.be.true;

      await gateway.connect(owner).unpause();
      expect(await gateway.paused()).to.be.false;
    });

    it('Should prevent non-owners from pausing', async function () {
      await expect(gateway.connect(other).pause())
        .to.be.revertedWithCustomError(gateway, 'OwnableUnauthorizedAccount')
        .withArgs(await other.getAddress());
    });

    it('Should block payments when paused', async function () {
      await gateway.connect(owner).pause();
      const paymentId = ethers.id('paused-payment');
      
      await expect(
        gateway.connect(payer).pay(paymentId)
      ).to.be.revertedWithCustomError(gateway, 'EnforcedPause');
    });

    it('Should allow owner to update treasury', async function () {
      const newTreasury = await other.getAddress();
      
      await expect(
        gateway.connect(owner).setTreasury(newTreasury)
      ).to.emit(gateway, 'TreasuryUpdated')
        .withArgs(await treasury.getAddress(), newTreasury);

      expect(await gateway.treasury()).to.equal(newTreasury);
    });
  });
});

