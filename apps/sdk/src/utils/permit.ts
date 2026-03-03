import { ethers, Signer } from 'ethers';

export interface PermitSignature {
  v: number;
  r: string;
  s: string;
  deadline: number;
}

/**
 * Check if token supports EIP-2612 permit
 */
export async function supportsPermit(
  tokenAddress: string,
  provider: ethers.Provider
): Promise<boolean> {
  try {
    const token = new ethers.Contract(
      tokenAddress,
      ['function DOMAIN_SEPARATOR() view returns (bytes32)'],
      provider
    );
    await token.DOMAIN_SEPARATOR();
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate EIP-2612 permit signature
 */
export async function signPermit(
  signer: Signer,
  tokenAddress: string,
  spenderAddress: string,
  value: bigint,
  deadline: number,
  provider: ethers.Provider
): Promise<PermitSignature> {
  const token = new ethers.Contract(
    tokenAddress,
    [
      'function name() view returns (string)',
      'function nonces(address) view returns (uint256)',
      'function DOMAIN_SEPARATOR() view returns (bytes32)'
    ],
    provider
  );

  const signerAddress = await signer.getAddress();
  const nonce = await token.nonces(signerAddress);
  const name = await token.name();
  const chainId = (await provider.getNetwork()).chainId;

  // EIP-712 domain
  const domain = {
    name,
    version: '1',
    chainId,
    verifyingContract: tokenAddress
  };

  // EIP-712 types
  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  };

  // Value to sign
  const message = {
    owner: signerAddress,
    spender: spenderAddress,
    value: value.toString(),
    nonce: nonce.toString(),
    deadline
  };

  // Sign
  const signature = await signer.signTypedData(domain, types, message);
  const sig = ethers.Signature.from(signature);

  return {
    v: sig.v,
    r: sig.r,
    s: sig.s,
    deadline
  };
}
