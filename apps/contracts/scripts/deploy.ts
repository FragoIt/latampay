import { ethers, network, run } from 'hardhat';

async function main() {
  const usdcAddress = process.env.CONTRACT_ADDRESS_USDC;
  const usdtAddress = process.env.CONTRACT_ADDRESS_USDT;
  const ownerAddress =
    process.env.GATEWAY_OWNER_ADDRESS ||
    (process.env.PRIVATE_KEY_DEPLOYER ? new ethers.Wallet(process.env.PRIVATE_KEY_DEPLOYER).address : undefined);

  if (!usdcAddress || !ethers.isAddress(usdcAddress)) {
    throw new Error('CONTRACT_ADDRESS_USDC must be a valid address');
  }

  if (!usdtAddress || !ethers.isAddress(usdtAddress)) {
    throw new Error('CONTRACT_ADDRESS_USDT must be a valid address');
  }

  if (!ownerAddress || !ethers.isAddress(ownerAddress)) {
    throw new Error('GATEWAY_OWNER_ADDRESS or PRIVATE_KEY_DEPLOYER must resolve to a valid address');
  }

  const [signer] = await ethers.getSigners();

  console.log(`\n🚀 Deploying LatamPayGateway to ${network.name}...`);
  console.log(`   > Deployer: ${await signer.getAddress()}`);
  console.log(`   > Owner   : ${ownerAddress}`);
  console.log(`   > USDC    : ${usdcAddress}`);
  console.log(`   > USDT    : ${usdtAddress}\n`);

  const LatamPayGateway = await ethers.getContractFactory('LatamPayGateway');
  const gateway = await LatamPayGateway.deploy(usdcAddress, usdtAddress, ownerAddress);
  await gateway.waitForDeployment();

  const deployedAddress = await gateway.getAddress();

  console.log(`✅ LatamPayGateway deployed at: ${deployedAddress}`);

  if (network.name !== 'hardhat' && process.env.AUTO_VERIFY === 'true') {
    console.log('🔍 AUTO_VERIFY enabled, attempting verification...');
    await run('verify:verify', {
      address: deployedAddress,
      constructorArguments: [usdcAddress, usdtAddress, ownerAddress],
      contract: 'contracts/LatamPayGateway.sol:LatamPayGateway',
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

