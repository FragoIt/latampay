# Quick Reference: EIP-2612 Permit Implementation

## 📋 TL;DR

Plan completado para añadir **One-Click Pay** usando EIP-2612 permit en LatamPay.

**Documentos creados:**
- `IMPLEMENTATION_PLAN_PERMIT.md` (675 líneas) - Plan técnico completo
- `RESUMEN_PLAN_PERMIT.md` (313 líneas) - Resumen ejecutivo en español
- `QUICK_REFERENCE_PERMIT.md` (este archivo) - Referencia rápida

---

## 🎯 ¿Qué es One-Click Pay?

Permite pagar en **una sola transacción** sin hacer `approve` previo:

**Antes (2 transacciones):**
```
User → approve(gateway, amount) → Transaction 1
User → pay(paymentId) → Transaction 2
```

**Después (1 transacción):**
```
User → payWithPermit(paymentId, deadline, v, r, s) → Transaction 1 ✅
```

---

## 📂 17 Archivos en el Plan

### Smart Contracts (4)
1. ✏️ `contracts/LatamPayGateway.sol` → +`payWithPermit()`
2. ✏️ `contracts/interfaces/ILatamPayGateway.sol` → Interface
3. ➕ `contracts/mocks/MockUSDCPermit.sol` → Token CON permit
4. ➕ `contracts/mocks/MockUSDTNoPermit.sol` → Token SIN permit

### Tests (3)
5. ➕ `test/LatamPayGateway.permit.test.ts` → 10+ casos de prueba
6. ➕ `test/fixtures/deployGatewayWithPermit.ts` → Fixtures + helpers
7. ✏️ `test/LatamPayGateway.test.ts` → Mantener compatibilidad

### Scripts (3)
8. ➕ `scripts/generatePermitSignature.ts` → Generar firmas EIP-712
9. ➕ `scripts/deploy.permit.ts` → Deploy con validación
10. ✏️ `scripts/deploy.ts` → (Opcional) flag verificación

### SDK (3)
11. ✏️ `src/index.ts` → +`payOneClick()`
12. ➕ `src/utils/permit.ts` → Utilidades firma
13. ➕ `src/types/permit.ts` → Tipos TS

### Documentación (4)
14. ➕ `docs/ONE_CLICK_PAY.md` → Guía completa
15. ✏️ `README.md` → Sección nueva
16. ✏️ `apps/contracts/README.md` → Docs técnicas
17. ✏️ `apps/sdk/README.md` → Docs SDK

---

## 🔄 Fases de Implementación

```
Fase 1: Smart Contracts (3 commits)
├── Commit 1: Mock contracts + fixtures
├── Commit 2: Interface + custom errors
└── Commit 3: payWithPermit() implementation

Fase 2: Tests (2 commits)
├── Commit 4: Basic test suite
└── Commit 5: Complete coverage (>90%)

Fase 3: SDK (1 commit)
└── Commit 6: Complete SDK implementation

Fase 4: Scripts & Docs (2 commits)
├── Commit 7: Deployment scripts
└── Commit 8: Complete documentation

Fase 5: Final (1 commit)
└── Commit 9: Lint, format, cleanup
```

**Total: 9 commits, 12-18 horas**

---

## 🔑 Función Principal: `payWithPermit()`

```solidity
function payWithPermit(
    bytes32 paymentId,
    address payer,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
) external whenNotPaused nonReentrant {
    // 1. Validar payment existe y no completado
    Payment storage payment = payments[paymentId];
    require(payment.merchant != address(0), "PaymentNotFound");
    require(!payment.completed, "PaymentAlreadyCompleted");
    require(payment.expiresAt == 0 || block.timestamp <= payment.expiresAt, "PaymentExpired");
    
    // 2. Marcar completado (CEI pattern)
    payment.completed = true;
    
    // 3. Calcular fee (0.3% = 30 bps)
    uint256 grossAmount = payment.amount;
    uint256 feeAmount = (grossAmount * 30) / 10_000;
    uint256 netAmount = grossAmount - feeAmount;
    
    // 4. Try-catch permit (fallback para tokens sin soporte)
    IERC20 token = IERC20(payment.token);
    try IERC20Permit(payment.token).permit(
        payer, address(this), grossAmount, deadline, v, r, s
    ) {} catch {}
    
    // 5. Transferir fee a treasury
    token.safeTransferFrom(payer, treasury, feeAmount);
    
    // 6. Transferir neto a merchant
    token.safeTransferFrom(payer, payment.merchant, netAmount);
    
    // 7. Emitir evento
    emit PaymentCompletedWithPermit(paymentId, payer, payment.merchant, grossAmount, feeAmount, block.timestamp);
}
```

---

## 🧪 Tests Clave (>90% Coverage)

```typescript
describe('payWithPermit', () => {
  it('should pay successfully with permit', async () => {
    // Generar firma EIP-712
    const {v, r, s} = await signPermit(owner, spender, value, deadline);
    
    // Ejecutar payWithPermit
    await gateway.payWithPermit(paymentId, payer, deadline, v, r, s);
    
    // Verificar transferencias
    expect(await token.balanceOf(treasury)).to.equal(feeAmount);
    expect(await token.balanceOf(merchant)).to.equal(netAmount);
  });

  it('should fallback to approve for tokens without permit', async () => {
    // Token sin permit
    const {v, r, s} = await signPermit(...); // firma dummy
    await tokenNoPermit.approve(gateway, amount);
    
    // Debe funcionar sin revert
    await gateway.payWithPermit(paymentId, payer, deadline, v, r, s);
  });

  it('should revert on expired deadline', async () => {
    const expiredDeadline = Math.floor(Date.now() / 1000) - 3600;
    await expect(
      gateway.payWithPermit(paymentId, payer, expiredDeadline, v, r, s)
    ).to.be.revertedWith('PERMIT_DEADLINE_EXPIRED');
  });

  // ... 7+ casos más
});
```

---

## 📱 SDK Usage

```typescript
import { LatamPayClient } from '@latampay/sdk';

// Inicializar cliente
const client = new LatamPayClient(gatewayAddress, provider);

// Opción 1: One-Click (automático)
const receipt = await client.payOneClick(paymentId, signer);
// ✅ Detecta automáticamente si token soporta permit
// ✅ Si soporta: usa payWithPermit (1 tx)
// ✅ Si NO soporta: usa approve + pay (2 txs)

// Opción 2: Manual (verificar soporte)
const hasPermit = await checkPermitSupport(tokenAddress, provider);
if (hasPermit) {
  const {v, r, s} = await generatePermitSignature(...);
  await gateway.payWithPermit(paymentId, payer, deadline, v, r, s);
} else {
  await token.approve(gateway, amount);
  await gateway.pay(paymentId);
}
```

---

## 🔐 Seguridad

| Protección | Implementado | Descripción |
|------------|--------------|-------------|
| ReentrancyGuard | ✅ | `nonReentrant` modifier |
| CEI Pattern | ✅ | Marcar completado antes de transferir |
| Pausable | ✅ | `whenNotPaused` modifier |
| Ownable | ✅ | Solo owner crea payments |
| Custom Errors | ✅ | Gas savings |
| Validaciones | ✅ | deadline, firma, status |

---

## 💰 Fee Calculation (0.3%)

```
Fee = 30 basis points (bps)
Divisor = 10,000

Ejemplos:
- 1,000 USDC → fee=3, net=997
- 10,000 USDC → fee=30, net=9,970
- 100 USDC → fee=0.3, net=99.7 (redondeado: fee=0, net=100)
```

**Fórmula:**
```solidity
uint256 feeAmount = (grossAmount * FEE_BPS) / BPS_DIVISOR;
uint256 netAmount = grossAmount - feeAmount;
```

---

## 📊 Comparación

| Aspecto | approve + pay | payWithPermit |
|---------|--------------|---------------|
| Transacciones | 2 | 1 |
| Firmas | 2 | 1 |
| Gas | ~100k | ~55k |
| Tiempo | ~30-60s | ~15s |
| UX | ❌ Complejo | ✅ Simple |
| Soporte | ✅ Todos los ERC20 | ⚠️ Solo EIP-2612 |
| Fallback | N/A | ✅ Automático |

---

## 🌐 Tokens en Polygon

| Token | Address (Polygon) | Permit | Plan |
|-------|------------------|--------|------|
| USDC | 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 | ✅ | Usar permit |
| USDT | 0xc2132D05D31c914a87C6611C10748AEb04B58e8F | ❌ | Fallback |
| DAI | 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063 | ✅ | Futuro |

---

## ⏱️ Timeline Estimado

```
Día 1 (6-8 horas):
├── Mock contracts (1h)
├── Interface + errors (1h)
├── payWithPermit() impl (2-3h)
├── Basic tests (2h)
└── Checkpoint: Contracts funcionales

Día 2 (4-6 horas):
├── Complete test suite (2-3h)
├── SDK implementation (2-3h)
└── Checkpoint: SDK + tests >90%

Día 3 (2-4 horas):
├── Scripts (1-2h)
├── Documentation (1-2h)
└── Final review + lint (1h)

TOTAL: 12-18 horas (~2-3 días)
```

---

## ✅ Checklist Final

### Pre-Implementation
- [x] Plan creado
- [ ] Plan revisado y aprobado
- [ ] Equipo alineado en alcance

### Smart Contracts
- [ ] MockUSDCPermit.sol creado
- [ ] MockUSDTNoPermit.sol creado
- [ ] ILatamPayGateway.sol actualizado
- [ ] LatamPayGateway.sol actualizado
- [ ] Contratos compilan sin warnings
- [ ] Gas optimization revisado

### Tests
- [ ] Fixture creado
- [ ] 10+ test cases implementados
- [ ] Coverage >90% verificado
- [ ] Tests pasan todos

### SDK
- [ ] permit.ts creado
- [ ] types/permit.ts creado
- [ ] index.ts actualizado
- [ ] SDK build exitoso
- [ ] Types generados correctamente

### Scripts
- [ ] generatePermitSignature.ts creado
- [ ] deploy.permit.ts creado
- [ ] Scripts probados localmente

### Documentation
- [ ] ONE_CLICK_PAY.md creado
- [ ] README.md actualizado
- [ ] contracts/README.md actualizado
- [ ] sdk/README.md actualizado
- [ ] Ejemplos de código agregados

### Final
- [ ] `pnpm lint` pasa
- [ ] `pnpm format` ejecutado
- [ ] `pnpm type-check` pasa
- [ ] `pnpm build` pasa
- [ ] PR description completo
- [ ] Security review completado

---

## 📚 Recursos

- **EIP-2612**: https://eips.ethereum.org/EIPS/eip-2612
- **OpenZeppelin ERC20Permit**: https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Permit
- **ethers.js signTypedData**: https://docs.ethers.org/v6/api/providers/#Signer-signTypedData
- **Hardhat Testing**: https://hardhat.org/hardhat-runner/docs/guides/test-contracts

---

## 🚀 Comandos Útiles

```bash
# Compilar contratos
cd apps/contracts
pnpm compile

# Ejecutar tests
pnpm test

# Coverage
pnpm coverage

# Generar tipos
pnpm typechain

# Build SDK
cd ../sdk
pnpm build

# Lint todo
cd ../..
pnpm lint

# Format todo
pnpm format

# Type-check todo
pnpm type-check

# Generar firma (cuando esté implementado)
cd apps/contracts
pnpm hardhat run scripts/generatePermitSignature.ts \
  --token 0x... \
  --spender 0x... \
  --value 1000000000
```

---

## 💡 Tips

1. **Implementar por fases**: No hacer todo de una vez
2. **Tests primero**: TDD approach para payWithPermit
3. **Validar frecuentemente**: Compilar y testear después de cada cambio
4. **Documentar durante**: No dejar docs para el final
5. **Security first**: Priorizar seguridad sobre optimización
6. **Backward compatible**: No romper funcionalidad existente
7. **Gas conscious**: Pero no optimizar prematuramente

---

## 🎯 Success Criteria

✅ Contracts compilan sin warnings  
✅ Tests pasan todos (>90% coverage)  
✅ SDK build exitoso  
✅ Lint pasa  
✅ Type-check pasa  
✅ Documentación completa  
✅ Security review aprobado  
✅ Backward compatible  
✅ Gas optimizado (reasonable)  
✅ User experience mejorada

---

**Status actual: ✅ PLAN COMPLETADO - Listo para implementar**

Documentos de referencia:
- `IMPLEMENTATION_PLAN_PERMIT.md` - Plan técnico detallado
- `RESUMEN_PLAN_PERMIT.md` - Resumen ejecutivo
- `QUICK_REFERENCE_PERMIT.md` - Esta guía rápida
