# 📊 LatamPay: Metrics Dashboard & Tracking

**Última actualización**: 2025-11-13  
**Owner**: Founder  
**Frecuencia actualización**: Semanal (viernes)

---

## 1. North Star Metrics

### Definición

**Primary**: Merchants Activos Pagantes (MAP)

- Definición: Merchants que procesaron ≥1 pago en últimos 30 días Y tienen plan de pago

**Secondary**: MRR (Monthly Recurring Revenue)

- Definición: Ingresos recurrentes mensuales de subscripciones SaaS + add-ons

**Tertiary**: GMV (Gross Merchandise Value)

- Definición: Volumen total procesado en USD equivalente

---

## 2. Current State (Baseline)

### Actualizado: 2025-11-13

```
┌─────────────────────────────────────────┐
│  LATAMPAY METRICS (Week 46, 2025)      │
├─────────────────────────────────────────┤
│  NORTH STAR                             │
│    Merchants Activos:            0      │
│    MRR:                      $0         │
│    GMV (30d):                $0         │
├─────────────────────────────────────────┤
│  GROWTH                                 │
│    Signups (semana):             0      │
│    Trials activos:               0      │
│    Conversión trial→pago:      N/A      │
├─────────────────────────────────────────┤
│  ENGAGEMENT                             │
│    DAU/MAU:                    N/A      │
│    Avg pagos/merchant:         N/A      │
│    Permit usage %:             N/A      │
├─────────────────────────────────────────┤
│  REVENUE                                │
│    ARPU:                       N/A      │
│    CAC:                        N/A      │
│    LTV:                        N/A      │
│    LTV:CAC ratio:              N/A      │
├─────────────────────────────────────────┤
│  RETENTION                              │
│    Churn rate (30d):           N/A      │
│    MRR Churn:                  N/A      │
│    NPS:                        N/A      │
└─────────────────────────────────────────┘
```

---

## 3. Weekly Tracking Template

### Semana [XX] - [Fecha]

#### Acquisition

| Métrica            | Target | Actual | Δ vs Semana Anterior | Status |
| ------------------ | ------ | ------ | -------------------- | ------ |
| Visitantes Landing | 100    | 0      | -                    | 🔴     |
| Leads Nuevos       | 20     | 0      | -                    | 🔴     |
| Leads ICP (%)      | 45%    | -      | -                    | 🔴     |
| Demos Agendadas    | 6      | 0      | -                    | 🔴     |
| Demos Realizadas   | 4      | 0      | -                    | 🔴     |
| Show Rate          | 70%    | -      | -                    | ⚪     |

#### Activation

| Métrica               | Target  | Actual | Δ vs Semana Anterior | Status |
| --------------------- | ------- | ------ | -------------------- | ------ |
| Signups               | 5       | 0      | -                    | 🔴     |
| Onboarding Completado | 70%     | -      | -                    | ⚪     |
| Time to First Invoice | <15 min | -      | -                    | ⚪     |
| First Payment <48h    | 50%     | -      | -                    | ⚪     |

#### Revenue

| Métrica                 | Target | Actual | Δ vs Semana Anterior | Status |
| ----------------------- | ------ | ------ | -------------------- | ------ |
| Nuevos Paying Customers | 2      | 0      | -                    | 🔴     |
| MRR Nuevo               | $100   | $0     | -                    | 🔴     |
| MRR Total               | -      | $0     | -                    | 🔴     |
| ARPU                    | $150   | -      | -                    | ⚪     |
| GMV (7d)                | $5k    | $0     | -                    | 🔴     |

#### Retention

| Métrica               | Target | Actual | Δ vs Semana Anterior | Status |
| --------------------- | ------ | ------ | -------------------- | ------ |
| Churn Count           | <1     | 0      | -                    | 🟢     |
| Churn Rate            | <8%    | -      | -                    | ⚪     |
| DAU                   | -      | -      | -                    | ⚪     |
| Avg Payments/Merchant | 3+     | -      | -                    | ⚪     |

#### Product

| Métrica              | Target | Actual | Δ vs Semana Anterior | Status |
| -------------------- | ------ | ------ | -------------------- | ------ |
| Permit Usage %       | >40%   | -      | -                    | ⚪     |
| Payment Success Rate | >95%   | -      | -                    | ⚪     |
| Avg Payment Value    | $500+  | -      | -                    | ⚪     |
| Webhook Delivery     | >99%   | -      | -                    | ⚪     |

**Leyenda**: 🟢 Sobre target | 🟡 Warning zone | 🔴 Below target | ⚪ No data yet

---

## 4. Cohort Analysis Template

### Cohort: [Mes de Signup]

**Tamaño cohort**: [N merchants]

| Mes | Activos | Retention % | MRR  | ARPU | Churn Count |
| --- | ------- | ----------- | ---- | ---- | ----------- |
| M0  | 10      | 100%        | $490 | $49  | 0           |
| M1  | 9       | 90%         | $500 | $56  | 1           |
| M2  | 8       | 80%         | $600 | $75  | 1           |
| M3  | 8       | 80%         | $720 | $90  | 0           |

**Insights**:

- Churn concentrado en M1 (típico trial→paid drop)
- ARPU aumenta post-M2 (upgrades + add-ons)
- M3+ estabiliza (producto-market fit micro)

---

## 5. Funnel Conversion (Cumulative)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  1,000 Visitors                                         │
│     │                                                   │
│     ├─► 10% conversion ─────► 100 Leads                │
│     │                                │                  │
│     │                                └─► 45% qualified  │
│     │                                    │              │
│     │                                    ▼              │
│     │                               45 ICP Qualified    │
│     │                                    │              │
│     │                                    └─► 65% book   │
│     │                                        │          │
│     │                                        ▼          │
│     │                                   29 Demos Booked │
│     │                                        │          │
│     │                                        └─► 75% show│
│     │                                            │      │
│     │                                            ▼      │
│     │                                       22 Demos    │
│     │                                            │      │
│     │                                            └─► 75% trial│
│     │                                                │  │
│     │                                                ▼  │
│     │                                           16 Trials│
│     │                                                │  │
│     │                                                └─► 60% pay│
│     │                                                    │
│     ▼                                                    ▼
│                                                    10 Paying
│                                                         │
│                                                         └─► 35% Pro
│                                                             │
│                                                             ▼
│                                                        3-4 Pro
└─────────────────────────────────────────────────────────┘
```

### Conversion Rates (Targets)

| Stage            | Target | Current | Red Flag | Action If Red Flag            |
| ---------------- | ------ | ------- | -------- | ----------------------------- |
| Visit → Lead     | 10%    | -       | <5%      | Revisar value prop landing    |
| Lead → Qualified | 45%    | -       | <30%     | Mejorar targeting             |
| Qualified → Demo | 65%    | -       | <50%     | Email nurture sequence        |
| Demo → Trial     | 75%    | -       | <60%     | Demo script + signup friction |
| Trial → Payment  | 60%    | -       | <40%     | **CRÍTICO** Onboarding        |
| Payment → Pro    | 35%    | -       | <20%     | Value perception + pricing    |

---

## 6. Key Ratios & Unit Economics

### Targets (Steady State)

| Ratio                    | Target    | Current | Benchmark     | Status |
| ------------------------ | --------- | ------- | ------------- | ------ |
| **LTV:CAC**              | >25:1     | -       | SaaS: 3:1     | ⚪     |
| **CAC Payback**          | <2 months | -       | SaaS: 12m     | ⚪     |
| **Gross Margin**         | >85%      | -       | SaaS: 70-80%  | ⚪     |
| **Net Dollar Retention** | >100%     | -       | Best: 120%+   | ⚪     |
| **Churn Rate**           | <5%       | -       | SaaS: 5-7%    | ⚪     |
| **DAU/MAU**              | >30%      | -       | Engaged: 40%+ | ⚪     |

### Calculations

```
LTV = ARPU × Gross Margin × (1 / Churn Rate)
    = $150 × 0.85 × (1 / 0.05)
    = $150 × 0.85 × 20
    = $2,550

CAC = (Sales & Marketing Spend) / New Customers
    = $1,500 / 15
    = $100

LTV:CAC = $2,550 / $100 = 25.5:1 ✅

CAC Payback = CAC / (ARPU × Gross Margin)
            = $100 / ($150 × 0.85)
            = $100 / $127.5
            = 0.78 months ✅
```

---

## 7. Red Flags & Alerts

### Automatic Alerts (Setup in Analytics)

| Metric               | Threshold   | Alert Level | Action                             |
| -------------------- | ----------- | ----------- | ---------------------------------- |
| Payment success rate | <90%        | 🔴 Critical | Investigate + notify customers     |
| Webhook delivery     | <95%        | 🟡 Warning  | Check queue + retry logic          |
| Trial→Payment <48h   | <30%        | 🔴 Critical | Emergency onboarding audit         |
| Signup→First invoice | >30 min avg | 🟡 Warning  | Simplify UX                        |
| Churn rate           | >10%        | 🔴 Critical | Customer calls + feature audit     |
| Demo show rate       | <60%        | 🟡 Warning  | Reminder emails + calendar invites |
| CAC                  | >$150       | 🟡 Warning  | Channel optimization               |
| Permit detection     | <90%        | 🟡 Warning  | Token compatibility check          |

---

## 8. Weekly Retro Framework

### Viernes 5pm: Retro Semanal

**1. Métricas Review (10 min)**

- ¿Qué movió? ¿Qué no movió?
- Red flags identificados

**2. Wins (5 min)**

- 3 cosas que salieron bien

**3. Blockers (10 min)**

- ¿Qué impidió progreso?
- ¿Decisiones pendientes?

**4. Learnings (10 min)**

- ¿Qué aprendimos de Design Partners?
- ¿Qué feedback sorprendió?

**5. Next Week Priorities (10 min)**

- Top 3 objetivos medibles
- ¿Qué NO vamos a hacer?

**6. Decisions Log**

- Documento decisiones key (date, decision, rationale)

---

## 9. Monthly Business Review

### Última semana del mes

**Executive Summary** (1 página):

- North Star: MAP, MRR, GMV
- Growth: New customers, pipeline
- Product: Key metrics (permit %, success rate)
- Retention: Churn, NPS
- Unit Economics: LTV, CAC, margin

**Deep Dives** (rotar mensual):

- Mes 1: Conversion funnel analysis
- Mes 2: Cohort retention deep dive
- Mes 3: ARPU growth drivers
- Mes 4: Product usage patterns

**Forward Looking**:

- Next month targets
- Roadmap adjustments
- Resource needs

---

## 10. Dashboard Tools Stack

### Phase 0-1 (Manual → Semi-automated)

**Tools**:

- Google Sheets: Manual tracking semanal
- Notion: Retro notes + decisions log
- PostHog (free): Basic analytics + funnels
- Stripe Dashboard: Billing metrics

### Phase 2-3 (Automated)

**Tools**:

- Metabase o Redash: Custom SQL dashboards
- Segment: Event tracking centralizado
- ChartMogul: SaaS metrics específicos
- Custom internal dashboard (React + PostgreSQL)

### Phase 4+ (Advanced)

**Tools**:

- Looker o Tableau: BI completo
- Amplitude: Product analytics avanzado
- ProfitWell: Revenue analytics
- Custom ML pipeline: Churn prediction

---

## 11. OKRs (Objectives & Key Results)

### Q4 2025 (Nov-Dec)

**Objective 1**: Validate Product-Market Fit con ICP inicial

**Key Results**:

- [ ] KR1: 10 Design Partners activos con charter firmado
- [ ] KR2: Trial→Payment conversion >50%
- [ ] KR3: 5 paying customers con >2 meses retención

**Objective 2**: Construir máquina de conversión predecible

**Key Results**:

- [ ] KR1: 100 leads ICP calificados (cumulative)
- [ ] KR2: Demo→Trial conversion >70%
- [ ] KR3: Document playbook completo (scripts, emails, proceso)

**Objective 3**: Establecer baseline de métricas core

**Key Results**:

- [ ] KR1: Dashboard semanal actualizado sin gaps
- [ ] KR2: CAC medido con precisión <$120
- [ ] KR3: ARPU baseline establecido ($50-150 range validado)

---

### Q1 2026 (Jan-Mar)

**Objective 1**: Alcanzar $5K MRR

**Key Results**:

- [ ] KR1: 40 paying customers
- [ ] KR2: ARPU $125+
- [ ] KR3: Churn <8%

**Objective 2**: Probar canal de adquisición escalable

**Key Results**:

- [ ] KR1: 1 canal con CAC <$100 validado
- [ ] KR2: 200 leads/mes orgánico + paid
- [ ] KR3: LTV:CAC >20:1

**Objective 3**: Launch features diferenciadores

**Key Results**:

- [ ] KR1: Fiscal module usado por 50% paying customers
- [ ] KR2: Subscriptions: 15 activas
- [ ] KR3: Net Dollar Retention >95%

---

### Q2 2026 (Apr-Jun)

**Objective 1**: Alcanzar $25K MRR

**Key Results**:

- [ ] KR1: 150 paying customers
- [ ] KR2: ARPU $166+
- [ ] KR3: 10 Growth plan customers

---

### Q3 2026 (Jul-Sep)

**Objective 1**: Alcanzar $50K MRR

**Key Results**:

- [ ] KR1: 300 paying customers
- [ ] KR2: ARPU $166+
- [ ] KR3: 5 Scale plan customers

---

### Q4 2026 (Oct-Dec)

**Objective 1**: Alcanzar $100K MRR 🎯

**Key Results**:

- [ ] KR1: 500+ paying customers
- [ ] KR2: ARPU $200+
- [ ] KR3: 3 Enterprise contracts

---

## 12. Tracking Spreadsheet Structure

### Google Sheet Tabs

**Tab 1: Weekly Snapshot**

- Columnas: Week, Date, MAP, MRR, GMV, New Customers, Churn, ARPU
- Fórmulas: Week-over-week % change

**Tab 2: Leads Pipeline**

- Columnas: Date, Name, Email, Company, Country, Source, Stage, Notes
- Stages: Lead → Qualified → Demo → Trial → Paying → Churned

**Tab 3: Demos Log**

- Columnas: Date, Merchant, Attended (Y/N), Trial Started, Pain Points, Next Steps
- Métricas: Show rate, Trial conversion

**Tab 4: Cohorts**

- Rows: Cohort month
- Columns: M0, M1, M2, M3... (retention %)
- Color coding: >80% green, 60-80% yellow, <60% red

**Tab 5: Unit Economics**

- Rows: Metric (LTV, CAC, Payback, etc)
- Columns: Target, Current, Benchmark
- Fórmulas: Auto-calculated

**Tab 6: OKRs Tracking**

- Rows: Each KR
- Columns: Target, Current, % Progress, Owner, Status
- Update: Weekly

---

## 13. Próximos Pasos (Setup Tracking)

### Esta Semana

1. [ ] **Crear Google Sheet "LatamPay Metrics"**
   - Copiar estructura de tabs 1-6
   - Setup fórmulas básicas
   - Share con equipo

2. [ ] **Setup PostHog**
   - Install snippet en landing + dashboard
   - Definir eventos clave:
     - `signup`
     - `invoice_created`
     - `payment_completed`
     - `plan_upgraded`
   - Setup funnel: Signup → Invoice → Payment

3. [ ] **Calendario tracking**
   - Recurring: Viernes 5pm "Metrics Update + Retro"
   - Recurring: Último viernes mes "Monthly BR"

4. [ ] **Baseline establishment**
   - Definir Week 0 metrics (all zeros)
   - Establecer targets para Week 4, 8, 12

5. [ ] **Alert setup**
   - Email alerts para red flags críticos
   - Slack integration (opcional)

---

## 14. Sample Weekly Update (Email Format)

```
Subject: LatamPay Weekly Update - Week 46

Team,

Here's this week's snapshot:

📈 GROWTH
- New signups: 5 (target: 5) ✅
- Demos: 3 (target: 4) 🟡
- New paying: 2 (target: 2) ✅

💰 REVENUE
- MRR: $447 (↑$98 vs last week)
- ARPU: $49.67
- GMV (7d): $12,450

🎯 KEY WINS
1. First Pro upgrade! (Agency XYZ)
2. Permit usage at 65% (above 40% target)
3. Onboarding completion 72% (above 60% target)

⚠️ BLOCKERS
1. Demo show rate 60% (below 70% target)
   → Action: Adding calendar reminder automation

🔜 NEXT WEEK FOCUS
1. Launch fiscal module beta (3 DPs)
2. Reach 10 paying customers milestone
3. Close 5 demos (high-quality leads in pipeline)

Full dashboard: [Link to Google Sheet]

Questions? Let's discuss in Friday retro.

Santiago
```

---

**Status**: 🟡 Ready to Track  
**Next Update**: Every Friday 5pm  
**Owner**: Founder
