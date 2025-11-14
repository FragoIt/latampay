# 🛠️ LatamPay: Product Roadmap (Execution-Focused)

**Última actualización**: 2025-11-13  
**Objetivo**: Evitar feature sprawl, maximizar ARPU, minimizar time-to-market

---

## Filosofía de Desarrollo

### Principios Core

1. **Impact Score > Todo**: `(ΔIngresos 90d + ΔRetención%) / Complejidad ≥ 8`
2. **Máximo 2 frentes complejos** simultáneos (complejidad ≥3)
3. **Versioning incremental**: V0 → V1 → V2 (no big bang)
4. **Design Partners drive roadmap**: Features validadas con 3+ DPs antes de general release
5. **Sticky > Flashy**: Priorizar retención sobre wow factor

### Matriz de Priorización

| Feature                | ARPU Impact | Retention Impact | Complejidad | Impact Score | Priority             |
| ---------------------- | ----------- | ---------------- | ----------- | ------------ | -------------------- |
| **Gateway + Permit**   | Alto        | Alto             | 2           | 45           | **P0** ✅            |
| **Invoice System**     | Muy Alto    | Alto             | 2           | 50           | **P0** ✅            |
| **Floor Fee**          | Alto        | Bajo             | 1           | 40           | **P0** ✅            |
| **Fiscal Básico**      | Alto        | Muy Alto         | 3           | 35           | **P0** ✅            |
| **Subscriptions**      | Alto        | Muy Alto         | 3           | 35           | **P1**               |
| **Analytics Básico**   | Medio       | Medio            | 2           | 20           | **P1**               |
| **Payouts Batch**      | Alto        | Medio            | 3           | 25           | **P1**               |
| **White-label**        | Muy Alto    | Alto             | 4           | 30           | **P2**               |
| **Analytics Avanzado** | Medio       | Medio            | 4           | 12           | **P3**               |
| **Risk Scoring**       | Bajo        | Bajo             | 4           | 5            | **P3**               |
| **FX Off-ramp**        | Muy Alto    | Alto             | 5           | 25           | **P4** (regulatorio) |

---

## Versiones (Slicing Strategy)

### Versión 0: Core MVP (Semanas 1-4)

**Objetivo**: First payment working end-to-end

**Features**:

- [x] Smart contract deployment (Polygon)
- [x] Gateway básico (createPayment, pay)
- [ ] One-click permit (EIP-2612)
- [ ] Invoice creation UI
- [ ] Payment link generation
- [ ] Dashboard básico (list payments)
- [ ] Floor fee logic ($0.25 min)
- [ ] Pricing tiers (Free/Pro)

**Tech Stack**:

- Contracts: Hardhat + OpenZeppelin
- Frontend: Next.js + Wagmi
- Backend: Express + Prisma + PostgreSQL
- Wallet: Wagmi + Wallet Connect

**Success Criteria**:

- [ ] End-to-end payment en testnet <2 min
- [ ] Permit detection funciona 100%
- [ ] Floor fee aplica correctamente
- [ ] Dashboard muestra payments en real-time

**Tiempo estimado**: 4 semanas (1 founder + 1 dev contractor)

---

### Versión 1: Business Critical (Semanas 5-8)

**Objetivo**: Features que justifican paid plans

**Features**:

- [ ] **Fiscal Básico** (P0)
  - Campo país en profile
  - Cálculo IVA por país (Colombia 19%, Argentina 21%, México 16%)
  - Campo retención (Colombia 1-2.5%, Argentina varies)
  - Export CSV contable (formato estándar)
  - Nota legal disclaimer (no advice fiscal)
- [ ] **Webhooks v1** (P1)
  - Event: `payment.completed`
  - Config: URL + secret en dashboard
  - Retry logic: 3 intentos exponencial backoff
  - Logs visible en dashboard

- [ ] **Dashboard Savings** (P1)
  - Widget: "Ahorro vs PayPal este mes"
  - Cálculo: `(volumen × 3%) - (volumen × 0.3%)`
  - Gráfico simple: Fees LatamPay vs Alternativas
- [ ] **Onboarding Checklist** (P0)
  - 5 pasos: Perfil → Wallet → Invoice → Link → Pago
  - Barra progreso
  - Invoice demo prellenada

**Tech Additions**:

- Webhook queue (Bull + Redis)
- CSV export library
- Charts (Recharts o similar)

**Success Criteria**:

- [ ] Fiscal: 3 DPs validan precisión IVA
- [ ] Webhooks: 100% delivery rate en tests
- [ ] Onboarding: >60% completan 5 pasos en 24h

**Tiempo estimado**: 4 semanas

---

### Versión 2: Retention & Scale (Meses 3-5)

**Objetivo**: Features sticky que reducen churn

**Features**:

- [ ] **Subscriptions/Retainers** (P1)
  - Crear suscripción recurrente (billing cycle: weekly/monthly)
  - Auto-charge on schedule
  - Retry logic (dunning): 3 intentos × 7 días
  - Email notifications (payment due, success, failed)
  - Webhook: `subscription.renewed`, `subscription.failed`
- [ ] **Plan Growth Launch** (P0)
  - Pricing: $119/m
  - Límites: 500 invoices, $150K volumen
  - Features: Webhooks ilimitados, multiusuario (3), analytics
- [ ] **Analytics Dashboard** (P1)
  - Revenue over time (chart)
  - Payments by status (pie chart)
  - Top clients by volume (table)
  - MRR tracking (if subscriptions)
  - Export reports (PDF/CSV)

- [ ] **Multi-user Basic** (P1)
  - Invite team members (email)
  - Roles: Admin, Member, Viewer
  - Permissions: Admin full, Member create invoices, Viewer read-only

**Tech Additions**:

- Cron jobs (node-cron o similar)
- Email service (SendGrid/Postmark)
- PDF generation (Puppeteer)
- Role-based access control

**Success Criteria**:

- [ ] Subscriptions: 5+ DPs usando activamente
- [ ] Growth plan: 20% upgrade rate from Pro
- [ ] Analytics: 70% DAU engagement
- [ ] Churn: <8% mensual

**Tiempo estimado**: 8 semanas

---

### Versión 3: Enterprise Ready (Meses 6-9)

**Objetivo**: Unlock high-ARPU customers

**Features**:

- [ ] **White-label** (P2)
  - Custom domain (CNAME)
  - Custom branding (logo, colors)
  - Branded emails
  - Branded invoices/receipts
  - Pricing: +$99/m add-on
- [ ] **Payouts Masivos** (P1)
  - Batch payout creation (CSV upload)
  - Schedule payouts (fecha futura)
  - Payout templates
  - Approval workflow (2-step)
  - Pricing: $10 per 200 payouts o 0.15% adicional
- [ ] **Plan Scale Launch** (P0)
  - Pricing: $249/m
  - Límites: Unlimited invoices, $500K volumen
  - Features: White-label, priority support, SLA 99.5%
- [ ] **Multi-tenant Hard** (P2)
  - Sub-accounts (agencies managing clients)
  - Hierarchical permissions
  - Consolidated billing
  - Sub-account analytics

**Tech Additions**:

- Multi-tenancy architecture refactor
- CNAME routing (Nginx/Cloudflare)
- CSV parser robust
- Approval workflow engine

**Success Criteria**:

- [ ] White-label: 5+ customers pagando add-on
- [ ] Scale plan: 10+ customers
- [ ] Payouts: $5K+ revenue add-on trimestral
- [ ] ARPU promedio: >$180

**Tiempo estimado**: 12 semanas

---

### Versión 4: Advanced & Enterprise (Meses 9-12)

**Objetivo**: Features diferenciadores avanzados

**Features**:

- [ ] **Plan Enterprise** (P0)
  - Pricing: Custom ($1K-$10K/m)
  - Features: SLA contractual, soporte prioritario, custom integrations
  - Contract-based, no self-service
- [ ] **Analytics Avanzado** (P3)
  - Cohort analysis (retention by signup date)
  - LTV prediction (ML básico o heurístico)
  - Churn prediction
  - Payment velocity trends
  - Pricing: +$39/m add-on
- [ ] **Risk Scoring Basic** (P3)
  - Wallet age heuristics
  - Transaction patterns
  - Blocklist check (Chainalysis API)
  - Risk score per payment
  - Pricing: +$29/m add-on
- [ ] **Integraciones ERP** (P2)
  - QuickBooks export
  - Xero export
  - SAP connector (Enterprise only)
  - Pricing: incluido Enterprise, +$49/m Scale/Pro

**Tech Additions**:

- ML pipeline básico (Python + FastAPI)
- API integrations (OAuth flows)
- Contract management system

**Success Criteria**:

- [ ] Enterprise: 3+ contracts firmados
- [ ] Analytics avanzado: 15% penetración paying customers
- [ ] Integraciones: 20% paying customers usando
- [ ] MRR: $100K+

**Tiempo estimado**: 12 semanas

---

## Feature Specs (Detallados)

### 1. Fiscal Básico (V1)

**User Story**: Como merchant, necesito calcular IVA/retención automáticamente para cumplir con mi contador.

**Scope**:

- Selector país en profile: Colombia, Argentina, México (inicial)
- Tabla tasas IVA hardcoded:
  ```
  Colombia: 19%
  Argentina: 21%
  México: 16%
  ```
- Campo opcional "Retención en la fuente" (%)
- En invoice creation: mostrar breakdown
  ```
  Subtotal: $1,000
  IVA (19%): $190
  Retención (1%): -$10
  Total: $1,180
  ```
- Export CSV botón en dashboard:
  ```csv
  Fecha,Cliente,Concepto,Subtotal,IVA,Retención,Total
  2025-11-13,Acme Corp,Dev services,$1000,$190,-$10,$1180
  ```

**Nota Legal** (disclaimer en dashboard):

```
"LatamPay no provee asesoría fiscal. Los cálculos son referenciales.
Consulta con tu contador para cumplimiento local."
```

**Acceptance Criteria**:

- [ ] Cálculo IVA correcto para 3 países
- [ ] CSV exportable formato contador-friendly
- [ ] 3 Design Partners validan con sus contadores
- [ ] Disclaimer legal visible

**Complejidad**: 3/5 (lógica simple, UX importante)

---

### 2. Subscriptions (V2)

**User Story**: Como merchant con retainers, necesito cobrar automáticamente cada mes sin recordar manualmente.

**Scope**:

- Create Subscription:
  - Cliente (address o email)
  - Monto fijo USD
  - Billing cycle: weekly, monthly, quarterly
  - Start date
  - End date (opcional, puede ser indefinido)
- Auto-charge flow:
  - Cron job daily check: "¿hay subscriptions due hoy?"
  - Generar payment on-chain automático
  - Intentar transferFrom con permit si soportado
  - Si falla: marcar como `payment_failed`
- Dunning (retry logic):
  - Retry 1: +24h
  - Retry 2: +72h (3 días)
  - Retry 3: +168h (7 días)
  - Después de 3 fallos: marcar subscription `past_due`
  - Email notificación en cada retry
- Webhooks:
  - `subscription.created`
  - `subscription.renewed` (pago exitoso)
  - `subscription.failed` (retry agotados)
  - `subscription.cancelled`
- Dashboard:
  - Tab "Suscripciones"
  - Lista: Cliente, Monto, Próximo cobro, Status
  - Acciones: Pausar, Cancelar, Ver historial

**Tech Stack**:

- Cron: node-cron (ejecuta cada 1 hora)
- Emails: SendGrid template
- State machine: `active` → `past_due` → `cancelled`

**Acceptance Criteria**:

- [ ] Subscription cobra automáticamente on schedule
- [ ] Retry logic funciona 3 intentos
- [ ] Emails enviados correctamente
- [ ] Webhooks disparados en eventos
- [ ] 5 DPs usando subscriptions activamente por 30 días

**Complejidad**: 3/5 (cron + state machine + email)

---

### 3. White-label (V3)

**User Story**: Como agency managing múltiples clients, necesito branded experience bajo mi dominio.

**Scope**:

- Custom Domain:
  - User configura CNAME: `pay.myagency.com` → `latampay.app`
  - SSL auto (Cloudflare/Let's Encrypt)
  - Payment pages render en custom domain
- Branding:
  - Upload logo (max 500KB, PNG/SVG)
  - Primary color (hex picker)
  - Secondary color
  - Font selector (3 opciones: Modern, Classic, Minimal)
- Branded Assets:
  - Payment page header con logo
  - Invoices PDF con logo + colores
  - Emails con header personalizado
  - Footer: "Powered by LatamPay" (pequeño)
- Dashboard Settings:
  - Tab "White-label" (solo Scale+)
  - Preview en tiempo real
  - Apply/Save

**Tech Stack**:

- CNAME routing: Nginx reverse proxy con SNI
- Theme engine: CSS variables dinámicas
- PDF templates: variables inyectadas

**Acceptance Criteria**:

- [ ] Custom domain funciona con SSL
- [ ] Logo + colores aplican correctamente
- [ ] Invoices PDF reflejan branding
- [ ] 3+ customers pagando add-on

**Complejidad**: 4/5 (infra DNS + theming)

---

## Dependencies & Blockers

### External Dependencies

| Dependency                  | Required For                | Risk   | Mitigation                          |
| --------------------------- | --------------------------- | ------ | ----------------------------------- |
| Polygon RPC reliability     | All payments                | Medium | Usar Alchemy/Infura con fallback    |
| Wallet providers (Metamask) | User payments               | Low    | Multi-wallet support (WC, Coinbase) |
| USDC contract Polygon       | All transactions            | Low    | Established token, bajo riesgo      |
| Email deliverability        | Subscriptions notifications | Medium | SendGrid + DKIM/SPF setup           |
| SSL certificates            | Custom domains              | Low    | Cloudflare auto-SSL                 |

### Technical Debt to Avoid

1. **No hardcodear reglas fiscales complejas**: Empezar simple (IVA %), iterar con feedback
2. **No custom auth temprano**: Usar wallet-based auth, postpone email/password
3. **No multi-chain prematuramente**: Focus Polygon, añadir chains solo si demanda clara
4. **No analytics complejos temprano**: Queries básicas PostgreSQL, no BI tool aún

---

## Release Process

### Testing Requirements

| Version | Test Coverage             | Manual QA          | Beta Users  |
| ------- | ------------------------- | ------------------ | ----------- |
| V0      | >80% unit + integration   | Full flow          | 3 internal  |
| V1      | >85% + fiscal tests       | Full + 3 DPs       | 5-10 DPs    |
| V2      | >85% + subscription tests | Full + 5 DPs       | 10-20 users |
| V3      | >85% + white-label tests  | Full + 3 Scale DPs | 20-50 users |
| V4      | >90% + security audit     | Full + Enterprise  | All users   |

### Deployment Strategy

- **Testnet First**: Todo feature se prueba en Polygon Mumbai 1 semana mínimo
- **Mainnet Canary**: Deploy feature flag 10% users initial
- **Full Rollout**: Después de 48h sin incidentes críticos
- **Rollback Plan**: Feature flags permiten desactivar inmediato

---

## Success Metrics por Versión

### V0 (MVP)

- [ ] 10 users completan primer pago en testnet
- [ ] Permit detection 100% accuracy
- [ ] Zero critical bugs post-deploy
- [ ] Time to first payment: <5 min

### V1 (Business Critical)

- [ ] 5 DPs validan fiscal module con contador
- [ ] Webhooks 99.9% delivery rate
- [ ] Onboarding completion: >60% en 24h
- [ ] First paying customers: 5+

### V2 (Retention)

- [ ] 10+ subscriptions activas
- [ ] Churn rate: <8%
- [ ] Growth plan: 20% upgrade rate
- [ ] DAU analytics: 70%

### V3 (Enterprise)

- [ ] 5+ white-label customers
- [ ] 10+ Scale plan customers
- [ ] ARPU: >$180
- [ ] Payouts add-on: $5K+ trimestral

### V4 (Advanced)

- [ ] 3+ Enterprise contracts
- [ ] MRR: $100K+
- [ ] Total merchants: 100+
- [ ] NPS: >40

---

## Roadmap Visual

```
Q4 2025
├─ Nov: V0 MVP (Gateway + Invoice + Permit)
├─ Dec: V1 Fiscal + Webhooks
└─

Q1 2026
├─ Jan: V2 Subscriptions
├─ Feb: V2 Analytics + Growth Plan
└─ Mar: V2 Polish + 50 merchants

Q2 2026
├─ Apr: V3 White-label
├─ May: V3 Payouts + Scale Plan
└─ Jun: V3 Multi-tenant

Q3 2026
├─ Jul: V4 Enterprise Plan
├─ Aug: V4 Analytics Avanzado
└─ Sep: V4 Integraciones ERP

Q4 2026
├─ Oct: 100 merchants 🎯
├─ Nov: $100K MRR 🎯
└─ Dec: Fundraise planning
```

---

## Riesgos & Mitigaciones

### Top 5 Riesgos Técnicos

1. **Permit no funciona en algunos tokens**
   - Mitigación: Fallback approve tradicional automático
   - Contingencia: Mantener función pay() legacy

2. **Cron jobs fallan (subscriptions)**
   - Mitigación: Monitoring + alertas + retry queue
   - Contingencia: Manual trigger backup

3. **Cálculos fiscales incorrectos**
   - Mitigación: Validar con contadores, disclaimer legal claro
   - Contingencia: Campo manual override

4. **Webhook failures altos**
   - Mitigación: Retry exponencial + logs + manual replay
   - Contingencia: Polling API como backup

5. **White-label routing complejo**
   - Mitigación: Empezar simple (solo subdomain), iterar
   - Contingencia: Postponer custom domain, solo branding

---

## Próximos Pasos (Esta Semana)

### Acciones Inmediatas

1. [ ] **Definir V0 final scope** (lockdown features)
2. [ ] **Setup development environment**
   - Hardhat project structure
   - Next.js + Wagmi frontend
   - Express API scaffold
3. [ ] **Create V0 milestone en GitHub**
   - Issues para cada feature
   - Asignar estimaciones
4. [ ] **Design Partners charter**
   - Template agreement
   - Lista 30 candidatos potenciales
5. [ ] **Weekly standups calendar**
   - Lunes: Plan semana
   - Viernes: Retro + decisiones

---

**Status**: 🟡 Ready to Build  
**Next Review**: End of Week 2 (Nov 27, 2025)  
**Owner**: Founder + Dev Contractor

---

## Apéndice: Feature Request Process

### Cómo Evaluar Nuevas Features

1. **Design Partner solicita feature**
2. **Evaluar**:
   - ¿Cuántos DPs lo necesitan? (min 3)
   - ¿ARPU impact? (calcular)
   - ¿Retention impact? (estimar)
   - ¿Complejidad? (1-5)
3. **Calcular Impact Score**: `(ΔIngresos + ΔRetención) / Complejidad`
4. **Si Score ≥8**: Añadir a backlog prioritario
5. **Si Score <8**: Nice-to-have (roadmap futuro)

### Template Feature Request

```markdown
**Feature**: [Nombre corto]
**Requested by**: [# DPs o users]
**Problem**: [Pain point específico]
**Proposed Solution**: [Brief description]
**ARPU Impact**: [$ estimado]
**Retention Impact**: [% estimado]
**Complejidad**: [1-5]
**Impact Score**: [Calculation]
**Priority**: [P0/P1/P2/P3/P4]
```
