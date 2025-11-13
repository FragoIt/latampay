import { expect } from 'chai';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { deployLatamPayGatewayFixture } from './fixtures/deployGateway';

describe('LatamPayGateway', () => {
  it('deposits supported tokens and updates balances', async () => {
    const { gateway, usdc, user, depositAmount } = await loadFixture(deployLatamPayGatewayFixture);
    const gatewayAddress = await gateway.getAddress();
    const usdcAddress = await usdc.getAddress();

    await usdc.connect(user).approve(gatewayAddress, depositAmount);

    await expect(gateway.connect(user).deposit(usdcAddress, depositAmount))
      .to.emit(gateway, 'Deposited')
      .withArgs(usdcAddress, user.address, depositAmount, anyValue);

    expect(await gateway.balanceOf(usdcAddress, user.address)).to.equal(depositAmount);
    expect(await usdc.balanceOf(gatewayAddress)).to.equal(depositAmount);
  });

  it('allows the owner to withdraw on behalf of a user', async () => {
    const { gateway, usdc, user, deployer, depositAmount } = await loadFixture(deployLatamPayGatewayFixture);
    const gatewayAddress = await gateway.getAddress();
    const usdcAddress = await usdc.getAddress();

    await usdc.connect(user).approve(gatewayAddress, depositAmount);
    await gateway.connect(user).deposit(usdcAddress, depositAmount);

    const tx = gateway.connect(deployer).withdraw(usdcAddress, user.address, depositAmount);

    await expect(tx)
      .to.emit(gateway, 'Withdrawn')
      .withArgs(usdcAddress, user.address, depositAmount, anyValue);

    await expect(tx).to.changeTokenBalances(usdc, [gateway, user], [-depositAmount, depositAmount]);

    expect(await gateway.balanceOf(usdcAddress, user.address)).to.equal(0n);
  });

  it('reverts deposits for unsupported tokens', async () => {
    const { gateway, user, depositAmount } = await loadFixture(deployLatamPayGatewayFixture);
    const MockUSDC = await ethers.getContractFactory('MockUSDC');
    const rogueToken = await MockUSDC.deploy(100_000n * 10n ** 6n, user.address);
    await rogueToken.waitForDeployment();

    await rogueToken.connect(user).approve(await gateway.getAddress(), depositAmount);

    await expect(gateway.connect(user).deposit(await rogueToken.getAddress(), depositAmount)).to.be.revertedWith(
      'LatamPayGateway: token not supported',
    );
  });

  it('allows the owner to toggle token support', async () => {
    const { gateway, usdt, deployer, treasury, depositAmount } = await loadFixture(deployLatamPayGatewayFixture);
    const gatewayAddress = await gateway.getAddress();
    const usdtAddress = await usdt.getAddress();

    await expect(gateway.connect(deployer).setTokenStatus(usdtAddress, false))
      .to.emit(gateway, 'TokenSupportUpdated')
      .withArgs(usdtAddress, false);

    expect(await gateway.isTokenSupported(usdtAddress)).to.equal(false);

    await expect(gateway.connect(deployer).setTokenStatus(usdtAddress, true))
      .to.emit(gateway, 'TokenSupportUpdated')
      .withArgs(usdtAddress, true);

    await usdt.connect(treasury).approve(gatewayAddress, depositAmount);
    await expect(gateway.connect(treasury).deposit(usdtAddress, depositAmount)).to.emit(gateway, 'Deposited');
  });

  it('prevents non-owners from withdrawing funds', async () => {
    const { gateway, usdc, user, depositAmount } = await loadFixture(deployLatamPayGatewayFixture);

    await usdc.connect(user).approve(await gateway.getAddress(), depositAmount);
    await gateway.connect(user).deposit(await usdc.getAddress(), depositAmount);

    await expect(
      gateway.connect(user).withdraw(await usdc.getAddress(), user.address, depositAmount),
    )
      .to.be.revertedWithCustomError(gateway, 'OwnableUnauthorizedAccount')
      .withArgs(user.address);
  });
});

