import { ethers } from 'hardhat';
import { Contract, Signer } from 'ethers';

export async function deployGatewayFixture(): Promise<{
  gateway: Contract;
  usdc: Contract;
  usdt: Contract;
  owner: Signer;
  merchant: Signer;
  payer: Signer;
  other: Signer;
  treasury: Signer;
}> {
  // Get signers
  const [owner, merchant, payer, other, treasury] = await ethers.getSigners();

  // Deploy Mock Tokens
  // MockUSDC does not have permit, MockUSDT has permit
  const initialSupply = ethers.parseUnits('1000000', 6); // 1,000,000 tokens

  const MockUSDC = await ethers.getContractFactory('MockUSDC');
  const usdc = await MockUSDC.deploy(initialSupply, await payer.getAddress());
  await usdc.waitForDeployment();

  const MockUSDT = await ethers.getContractFactory('MockUSDT');
  const usdt = await MockUSDT.deploy(initialSupply, await payer.getAddress());
  await usdt.waitForDeployment();

  // Deploy LatamPayGateway
  const LatamPayGateway = await ethers.getContractFactory('contracts/LatamPayGateway.sol:LatamPayGateway');
  const gatewayInstance = await LatamPayGateway.deploy(
    await usdc.getAddress(),
    await usdt.getAddress(),
    await treasury.getAddress(),
    await owner.getAddress()
  );
  await gatewayInstance.waitForDeployment();

  const gateway = gatewayInstance as unknown as Contract;
  const usdcToken = usdc as unknown as Contract;
  const usdtToken = usdt as unknown as Contract;

  return { gateway, usdc: usdcToken, usdt: usdtToken, owner, merchant, payer, other, treasury };
}

