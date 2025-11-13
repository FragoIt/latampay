# Plan de Implementación: Soporte EIP-2612 Permit (One-Click Pay)

## Resumen Ejecutivo

Este plan detalla la implementación de funcionalidad "One-Click Pay" usando EIP-2612 (permit) en el monorepo LatamPay, permitiendo transacciones de pago en una sola firma sin necesidad de approve previo.

---

## 1. Archivos a Crear/Modificar

### 1.1 Smart Contracts (`apps/contracts/contracts/`)

#### Archivos a Modificar:
1. **`contracts/LatamPayGateway.sol`**
   - Añadir función `payWithPermit(bytes32 paymentId, address payer, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`
   - Añadir evento `PaymentCompletedWithPermit`
   - Mantener patrón CEI (Checks-Effects-Interactions)
   - Aplicar ReentrancyGuard, Pausable

2. **`contracts/interfaces/ILatamPayGateway.sol`**
   - Añadir firma de función `payWithPermit`
   - Añadir evento `PaymentCompletedWithPermit`

#### Archivos a Crear:
3. **`contracts/mocks/MockUSDCPermit.sol`** (nuevo)
   - Mock ERC20 con soporte EIP-2612
   - Implementar `permit()`, `nonces()`, `DOMAIN_SEPARATOR()`
   - 6 decimales (como USDC real)

4. **`contracts/mocks/MockUSDTNoPermit.sol`** (nuevo)
   - Mock ERC20 sin soporte permit (para testing de fallback)
   - 6 decimales

### 1.2 Tests (`apps/contracts/test/`)

#### Archivos a Crear:
5. **`test/LatamPayGateway.permit.test.ts`** (nuevo)
   - Test suite completa para funcionalidad permit
   - Casos: flujo exitoso, expiración, firma inválida, token sin permit
   - Cobertura objetivo: >90%

6. **`test/fixtures/deployGatewayWithPermit.ts`** (nuevo)
   - Fixture para desplegar gateway con tokens permit/no-permit
   - Incluir helpers para generar firmas EIP-712

#### Archivos a Modificar:
7. **`test/LatamPayGateway.test.ts`**
   - Actualizar si es necesario para mantener compatibilidad
   - Asegurar que tests existentes sigan pasando

### 1.3 Scripts (`apps/contracts/scripts/`)

#### Archivos a Crear:
8. **`scripts/generatePermitSignature.ts`** (nuevo)
   - Utilidad para generar firmas EIP-712 permit
   - Parámetros: owner, spender, value, deadline, nonce
   - Output: v, r, s

9. **`scripts/deploy.permit.ts`** (nuevo)
   - Script de deployment específico con validación de permit
   - Detectar si tokens soportan permit

#### Archivos a Modificar:
10. **`scripts/deploy.ts`**
    - Opcional: añadir flag para verificar soporte permit de tokens

### 1.4 SDK (`apps/sdk/src/`)

#### Archivos a Modificar:
11. **`src/index.ts`**
    - Añadir clase `LatamPayClient` con método `payOneClick(paymentId, signer)`
    - Añadir helper `checkPermitSupport(tokenAddress)`
    - Implementar generación de firma EIP-712
    - Detectar soporte permit: checar `DOMAIN_SEPARATOR` y `nonces`

#### Archivos a Crear:
12. **`src/utils/permit.ts`** (nuevo)
    - Utilidades para firma EIP-712
    - Tipos TypeScript para permit
    - Función `generatePermitSignature`
    - Función `hasPermitSupport`

13. **`src/types/permit.ts`** (nuevo)
    - Tipos TypeScript: `PermitData`, `EIP712Domain`, `PermitSignature`

### 1.5 Documentación

#### Archivos a Crear:
14. **`docs/ONE_CLICK_PAY.md`** (nuevo)
    - Guía completa de uso de One-Click Pay
    - Ejemplos de código
    - Diagramas de flujo

#### Archivos a Modificar:
15. **`README.md`**
    - Añadir sección "One-Click Pay (EIP-2612 Permit)"
    - Link a documentación detallada

16. **`apps/contracts/README.md`** (crear si no existe)
    - Documentación técnica de contratos
    - Explicación de payWithPermit

17. **`apps/sdk/README.md`** (crear si no existe)
    - Documentación de SDK
    - Ejemplos de uso de payOneClick

---

## 2. Resumen de Cambios por Archivo

### 2.1 `contracts/LatamPayGateway.sol`

**Cambios:**
- Importar `IERC20Permit` de OpenZeppelin
- Añadir custom error: `PermitFailed()`, `InvalidSignature()`
- Añadir evento: `PaymentCompletedWithPermit(bytes32 indexed paymentId, address indexed payer, address indexed merchant, uint256 amountPaid, uint256 feeCollected, uint256 timestamp)`
- Añadir función pública:
  ```solidity
  function payWithPermit(
      bytes32 paymentId,
      address payer,
      uint256 deadline,
      uint8 v,
      bytes32 r,
      bytes32 s
  ) external whenNotPaused nonReentrant
  ```
- Implementación:
  1. Validar que payment existe y no está completado
  2. Validar expiración del payment
  3. Marcar como completado (CEI pattern)
  4. Calcular fee (0.3% = 30 bps / 10000)
  5. Intentar `permit()` con try-catch (para tokens sin soporte)
  6. Transferir fee a treasury
  7. Transferir net amount a merchant
  8. Emitir evento

### 2.2 `contracts/interfaces/ILatamPayGateway.sol`

**Cambios:**
- Añadir firma de función `payWithPermit`
- Añadir declaración de evento `PaymentCompletedWithPermit`

### 2.3 `contracts/mocks/MockUSDCPermit.sol` (nuevo)

**Contenido:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract MockUSDCPermit is ERC20, ERC20Permit {
    uint8 private immutable _customDecimals;

    constructor(uint256 initialSupply, address recipient) 
        ERC20("Mock USDC Permit", "mUSDCP") 
        ERC20Permit("Mock USDC Permit") 
    {
        _customDecimals = 6;
        _mint(recipient, initialSupply);
    }

    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }
}
```

### 2.4 `contracts/mocks/MockUSDTNoPermit.sol` (nuevo)

**Contenido:**
- Igual que MockUSDT actual pero con nombre diferente
- Para testing explícito de fallback sin permit

### 2.5 `test/LatamPayGateway.permit.test.ts` (nuevo)

**Test Cases:**
1. **Flujo exitoso con permit**
   - Crear payment
   - Generar firma válida
   - Ejecutar payWithPermit
   - Verificar transferencias (fee + net)
   - Verificar evento

2. **Fallback para token sin permit**
   - Crear payment con token sin permit
   - Hacer approve previo
   - Ejecutar payWithPermit (debe funcionar sin revert)
   - Verificar transferencias

3. **Deadline expirado**
   - Crear payment
   - Generar firma con deadline pasado
   - Verificar revert

4. **Firma mal formada**
   - Firma con v incorrecto
   - Firma con r/s incorrectos
   - Verificar revert con InvalidSignature

5. **Payment expirado**
   - Crear payment con expiresAt en pasado
   - Intentar payWithPermit
   - Verificar revert PaymentExpired

6. **Payment ya completado**
   - Completar payment
   - Intentar payWithPermit nuevamente
   - Verificar revert PaymentAlreadyCompleted

7. **Cálculo correcto de fees**
   - Verificar que 0.3% = 30/10000
   - amount=1000 USDC → fee=3, net=997
   - Verificar redondeo hacia abajo

8. **Reentrancy protection**
   - Verificar que nonReentrant funciona

9. **Paused state**
   - Pausar contrato
   - Intentar payWithPermit
   - Verificar revert

10. **Coverage edge cases**
    - paymentId = bytes32(0)
    - amount muy grande
    - payer = address(0)

**Cobertura objetivo: >90%**

### 2.6 `test/fixtures/deployGatewayWithPermit.ts` (nuevo)

**Contenido:**
- Deploy MockUSDCPermit y MockUSDTNoPermit
- Deploy LatamPayGateway
- Helper: `signPermit(owner, spender, value, deadline, nonce, token)`
  - Usa ethers.js para generar firma EIP-712
  - Retorna {v, r, s}
- Fixture incluye objetos de firma listos para usar

### 2.7 `scripts/generatePermitSignature.ts` (nuevo)

**Funcionalidad:**
```typescript
import { ethers } from 'hardhat';

async function generatePermitSignature(
  tokenAddress: string,
  owner: string,
  spender: string,
  value: bigint,
  deadline: number,
  nonce: number,
  privateKey: string
) {
  // Obtener DOMAIN_SEPARATOR del token
  // Construir typedData EIP-712
  // Firmar con wallet
  // Retornar {v, r, s}
}

// CLI usage: 
// pnpm hardhat run scripts/generatePermitSignature.ts --token 0x... --spender 0x... --value 1000
```

### 2.8 `scripts/deploy.permit.ts` (nuevo)

**Funcionalidad:**
- Similar a deploy.ts
- Añade validación post-deployment:
  - Verificar si USDC/USDT soportan permit
  - Log warning si no soportan
  - Sugerir usar approve tradicional

### 2.9 `src/index.ts` (SDK)

**Cambios:**
```typescript
export class LatamPayClient {
  constructor(
    private gatewayAddress: string,
    private provider: ethers.Provider
  ) {}

  /**
   * Paga un payment con One-Click usando permit
   * @param paymentId - ID del payment
   * @param signer - Wallet del pagador
   * @returns Transaction receipt
   */
  async payOneClick(
    paymentId: string,
    signer: ethers.Signer
  ): Promise<ethers.TransactionReceipt> {
    // 1. Obtener payment info del contrato
    const payment = await this.getPayment(paymentId);
    
    // 2. Verificar si token soporta permit
    const hasPermit = await checkPermitSupport(payment.token);
    
    // 3. Si soporta, generar firma permit
    if (hasPermit) {
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hora
      const {v, r, s} = await generatePermitSignature(
        payment.token,
        await signer.getAddress(),
        this.gatewayAddress,
        payment.amount,
        deadline,
        signer
      );
      
      // 4. Llamar payWithPermit
      const tx = await gateway.payWithPermit(
        paymentId,
        await signer.getAddress(),
        deadline,
        v, r, s
      );
      return await tx.wait();
    } else {
      // 5. Fallback: approve + pay tradicional
      const token = new ethers.Contract(payment.token, ERC20_ABI, signer);
      await (await token.approve(this.gatewayAddress, payment.amount)).wait();
      const tx = await gateway.pay(paymentId);
      return await tx.wait();
    }
  }

  async getPayment(paymentId: string) {
    // Leer payment del contrato
  }
}

export { checkPermitSupport } from './utils/permit';
export { generatePermitSignature } from './utils/permit';
```

### 2.10 `src/utils/permit.ts` (nuevo)

**Contenido:**
```typescript
import { ethers } from 'ethers';

export async function checkPermitSupport(
  tokenAddress: string,
  provider: ethers.Provider
): Promise<boolean> {
  const token = new ethers.Contract(tokenAddress, [
    'function DOMAIN_SEPARATOR() view returns (bytes32)',
    'function nonces(address) view returns (uint256)'
  ], provider);
  
  try {
    await token.DOMAIN_SEPARATOR();
    await token.nonces(ethers.ZeroAddress);
    return true;
  } catch {
    return false;
  }
}

export async function generatePermitSignature(
  tokenAddress: string,
  owner: string,
  spender: string,
  value: bigint,
  deadline: number,
  signer: ethers.Signer
): Promise<{v: number, r: string, s: string}> {
  const token = new ethers.Contract(tokenAddress, [
    'function nonces(address) view returns (uint256)',
    'function name() view returns (string)',
    'function version() view returns (string)'
  ], signer);
  
  const nonce = await token.nonces(owner);
  const name = await token.name();
  const chainId = (await signer.provider!.getNetwork()).chainId;
  
  const domain = {
    name,
    version: '1',
    chainId,
    verifyingContract: tokenAddress
  };
  
  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  };
  
  const message = {
    owner,
    spender,
    value: value.toString(),
    nonce: nonce.toString(),
    deadline
  };
  
  const signature = await signer.signTypedData(domain, types, message);
  const sig = ethers.Signature.from(signature);
  
  return {
    v: sig.v,
    r: sig.r,
    s: sig.s
  };
}
```

### 2.11 `src/types/permit.ts` (nuevo)

**Contenido:**
```typescript
export interface PermitData {
  owner: string;
  spender: string;
  value: bigint;
  deadline: number;
  nonce: number;
}

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface PermitSignature {
  v: number;
  r: string;
  s: string;
}
```

### 2.12 `docs/ONE_CLICK_PAY.md` (nuevo)

**Contenido:**
- Introducción a EIP-2612
- Ventajas del One-Click Pay
- Guía paso a paso
- Ejemplos de código (SDK)
- Diagrama de flujo
- Troubleshooting
- FAQ

### 2.13 `README.md`

**Añadir sección:**
```markdown
## 🚀 One-Click Pay (EIP-2612 Permit)

LatamPay soporta pagos en una sola transacción usando EIP-2612 permit, eliminando la necesidad de hacer `approve` previo para tokens compatibles.

### Ventajas
- ✅ Una sola transacción (vs dos: approve + pay)
- ✅ Mejor UX para el usuario
- ✅ Ahorro de gas
- ✅ Fallback automático para tokens sin permit

### Uso Rápido (SDK)
```typescript
import { LatamPayClient } from '@latampay/sdk';

const client = new LatamPayClient(gatewayAddress, provider);
const receipt = await client.payOneClick(paymentId, signer);
```

📖 [Ver documentación completa](./docs/ONE_CLICK_PAY.md)
```

---

## 3. Orden Sugerido de Implementación

### Fase 1: Smart Contracts (2-3 commits)

**Commit 1: Mock contracts y fixtures**
1. Crear `MockUSDCPermit.sol`
2. Crear `MockUSDTNoPermit.sol`
3. Crear `test/fixtures/deployGatewayWithPermit.ts`
4. Verificar que compila

**Commit 2: Interfaz y errores**
1. Modificar `ILatamPayGateway.sol` (añadir función y evento)
2. Añadir custom errors en `LatamPayGateway.sol`
3. Compilar y verificar

**Commit 3: Implementación payWithPermit**
1. Implementar función `payWithPermit` en `LatamPayGateway.sol`
2. Seguir patrón CEI
3. Incluir try-catch para permit
4. Compilar y verificar

### Fase 2: Tests (1-2 commits)

**Commit 4: Test suite básica**
1. Crear `LatamPayGateway.permit.test.ts`
2. Implementar casos: flujo exitoso, fallback, deadline
3. Ejecutar tests y verificar que pasan

**Commit 5: Test coverage completo**
1. Añadir casos edge: firma inválida, reentrancy, paused
2. Añadir tests de fee calculation
3. Ejecutar coverage y verificar >90%

### Fase 3: SDK (1 commit)

**Commit 6: SDK implementation**
1. Crear `src/utils/permit.ts`
2. Crear `src/types/permit.ts`
3. Modificar `src/index.ts` con `LatamPayClient` y `payOneClick`
4. Build SDK y verificar tipos

### Fase 4: Scripts y Documentación (1-2 commits)

**Commit 7: Scripts de deployment**
1. Crear `scripts/generatePermitSignature.ts`
2. Crear `scripts/deploy.permit.ts`
3. Modificar `scripts/deploy.ts` (opcional)
4. Testing manual de scripts

**Commit 8: Documentación**
1. Crear `docs/ONE_CLICK_PAY.md`
2. Modificar `README.md` (sección One-Click Pay)
3. Crear/modificar `apps/contracts/README.md`
4. Crear/modificar `apps/sdk/README.md`

### Fase 5: Final Review (1 commit)

**Commit 9: Lint, format y cleanup**
1. Ejecutar `pnpm lint` en root
2. Ejecutar `pnpm format`
3. Revisar todos los tests
4. Ejecutar build completo
5. Verificar documentación

---

## 4. Comandos de Verificación

### Post cada fase:

```bash
# Compilar contratos
cd apps/contracts
pnpm compile

# Ejecutar tests
pnpm test

# Coverage
pnpm coverage

# Lint
cd ../..
pnpm lint

# Build SDK
cd apps/sdk
pnpm build

# Type-check completo
cd ../..
pnpm type-check
```

---

## 5. Consideraciones Técnicas

### 5.1 EIP-2612 Permit

- **Estándar**: https://eips.ethereum.org/EIPS/eip-2612
- **Función**: `permit(owner, spender, value, deadline, v, r, s)`
- **Domain separator**: Identificador único por token y chain
- **Nonces**: Counter por usuario para evitar replay attacks

### 5.2 Tokens en Polygon

- **USDC Polygon**: Soporta permit (USDC bridgeado usa ERC20Permit)
- **USDT Polygon**: NO soporta permit nativamente
- **Solución**: Fallback automático con try-catch

### 5.3 Seguridad

- **ReentrancyGuard**: Mantener en payWithPermit
- **CEI Pattern**: Marcar completed antes de transferencias
- **Pausable**: Respetar paused state
- **Validaciones**: deadline, firma, payment status
- **Gas**: Permit añade ~45k gas vs approve+pay tradicional

### 5.4 Gas Optimization

- Usar `immutable` donde sea posible
- Custom errors en lugar de require strings
- Eventos indexados solo en campos necesarios

### 5.5 Backward Compatibility

- Mantener función `pay()` original
- No romper tests existentes
- SDK debe soportar ambos flujos

---

## 6. Testing Checklist

- [ ] Flujo permit exitoso
- [ ] Fallback para token sin permit
- [ ] Deadline expirado
- [ ] Firma inválida (v, r, s)
- [ ] Payment no existe
- [ ] Payment ya completado
- [ ] Payment expirado
- [ ] Fee calculation correcto (0.3%)
- [ ] Reentrancy protection
- [ ] Paused state
- [ ] Edge cases (paymentId=0, amount=0)
- [ ] Coverage >90%

---

## 7. Deployment Checklist

- [ ] Compilar contratos sin warnings
- [ ] Todos los tests pasan
- [ ] Coverage >90%
- [ ] Lint pasa
- [ ] Type-check pasa
- [ ] Build SDK exitoso
- [ ] Documentación completa
- [ ] README actualizado
- [ ] Scripts de deployment probados
- [ ] Script generatePermitSignature funcional

---

## 8. Estimación de Esfuerzo

- **Fase 1 (Smart Contracts)**: 4-6 horas
- **Fase 2 (Tests)**: 3-4 horas
- **Fase 3 (SDK)**: 2-3 horas
- **Fase 4 (Scripts y Docs)**: 2-3 horas
- **Fase 5 (Review)**: 1-2 horas

**Total estimado**: 12-18 horas

---

## 9. Referencias

- [EIP-2612: Permit Extension for EIP-20](https://eips.ethereum.org/EIPS/eip-2612)
- [OpenZeppelin ERC20Permit](https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Permit)
- [ethers.js signTypedData](https://docs.ethers.org/v6/api/providers/#Signer-signTypedData)
- [Hardhat Testing](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)

---

## 10. Notas Adicionales

- Este es un plan sin código implementado, como solicitado
- El código mostrado son ejemplos ilustrativos
- Se debe validar cada implementación con tests
- Mantener compatibilidad con código existente
- Priorizar seguridad sobre optimización prematura
