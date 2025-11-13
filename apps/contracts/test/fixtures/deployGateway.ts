import { ethers } from 'hardhat';

const ONE_MILLION = 1_000_000n;
const SIX_DECIMALS = 10n ** 6n;
const INITIAL_SUPPLY = ONE_MILLION * SIX_DECIMALS;

export async function deployLatamPayGatewayFixture() {
  const [deployer, user, treasury] = await ethers.getSigners();

  const MockUSDC = await ethers.getContractFactory('MockUSDC');
  const usdc = await MockUSDC.deploy(INITIAL_SUPPLY, user.address);
  await usdc.waitForDeployment();

  const MockUSDT = await ethers.getContractFactory('MockUSDT');
  const usdt = await MockUSDT.deploy(INITIAL_SUPPLY, treasury.address);
  await usdt.waitForDeployment();

  const LatamPayGateway = await ethers.getContractFactory('LatamPayGateway');
  const gateway = await LatamPayGateway.deploy(usdc.target, usdt.target, deployer.address);
  await gateway.waitForDeployment();

  return {
    deployer,
    user,
    treasury,
    usdc,
    usdt,
    gateway,
    depositAmount: 1_000n * SIX_DECIMALS,
  };
}

