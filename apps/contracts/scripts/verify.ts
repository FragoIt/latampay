import hre, { ethers } from 'hardhat';

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS_GATEWAY;
  const usdcAddress = process.env.CONTRACT_ADDRESS_USDC;
  const usdtAddress = process.env.CONTRACT_ADDRESS_USDT;
  const ownerAddress =
    process.env.GATEWAY_OWNER_ADDRESS ||
    (process.env.PRIVATE_KEY_DEPLOYER ? new ethers.Wallet(process.env.PRIVATE_KEY_DEPLOYER).address : undefined);

  if (!contractAddress || !ethers.isAddress(contractAddress)) {
    throw new Error('CONTRACT_ADDRESS_GATEWAY must be a valid address');
  }

  if (!usdcAddress || !ethers.isAddress(usdcAddress)) {
    throw new Error('CONTRACT_ADDRESS_USDC must be a valid address');
  }

  if (!usdtAddress || !ethers.isAddress(usdtAddress)) {
    throw new Error('CONTRACT_ADDRESS_USDT must be a valid address');
  }

  if (!ownerAddress || !ethers.isAddress(ownerAddress)) {
    throw new Error('GATEWAY_OWNER_ADDRESS or PRIVATE_KEY_DEPLOYER must resolve to a valid address');
  }

  console.log('\n🔍 Verifying LatamPayGateway...');
  console.log(`   > Address : ${contractAddress}`);
  console.log(`   > Network : ${hre.network.name}`);

  await hre.run('verify:verify', {
    address: contractAddress,
    constructorArguments: [usdcAddress, usdtAddress, ownerAddress],
    contract: 'contracts/LatamPayGateway.sol:LatamPayGateway',
  });

  console.log('✅ Verification request sent');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

