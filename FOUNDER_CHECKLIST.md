# ✅ LatamPay: Lista de Verificación del Fundador

**Fecha creación**: 2025-11-13  
**Owner**: Santiago Fragozo  
**Propósito**: Tracking diario/semanal de ejecución

---

## 🎯 Estado Actual

```
[X] Análisis conceptual completado (Score: 7.1/10, potencial 8.0)
[X] Plan estratégico creado (4 documentos, 15K+ palabras)
[ ] Decisión tomada: ¿Proceder con este plan?
[ ] Ejecución iniciada
```

---

## 📅 Semana 1: Fundación (Nov 13-19, 2025)

### Día 1 - Lunes 13 Nov (HOY)

**Planning & Setup** (3-4 horas)

- [ ] ☑️ **Leer documentos estratégicos completos**
  - [ ] MASTER_PLAN.md (30 min)
  - [ ] GTM_STRATEGY.md (45 min)
  - [ ] PRODUCT_ROADMAP.md (30 min)
  - [ ] METRICS_TRACKING.md (20 min)
  - [ ] EXECUTIVE_SUMMARY.md (15 min)

- [ ] 🤔 **Tomar decisión crítica**
  - [ ] ¿Acepto este plan al 100%?
  - [ ] ¿Qué ajustes necesarios?
  - [ ] ¿Commitment realista?
  - [ ] Documentar decisión

- [ ] 📊 **Setup tracking básico**
  - [ ] Crear Google Sheet "LatamPay Metrics"
  - [ ] Copiar tabs: Weekly, Leads, Demos, Cohorts, Economics, OKRs
  - [ ] Setup fórmulas básicas
  - [ ] Establecer Week 0 baseline (todos en 0)

**Notas**:

```
Decisión tomada: [SÍ/NO/AJUSTES]
Ajustes necesarios:
-
-
-

Próximo paso: [Acción específica]
```

---

### Día 2 - Martes 14 Nov

**Landing Page Rewrite** (4-5 horas)

- [ ] 🎨 **Hero section nueva**
  - [ ] Headline: "Agencias LATAM: Cobra en USD y ahorra 70% en fees"
  - [ ] Subheadline: Valor concreto (facturas + one-click + fiscal)
  - [ ] Screenshot dashboard (mockup ok)
  - [ ] CTA primario: "Calcula tu ahorro"

- [ ] 🧮 **Calculadora de ahorro**
  - [ ] Form simple: Volumen mensual USD, % fee actual
  - [ ] Cálculo: Ahorro mensual, ahorro anual
  - [ ] Visualización: Fees actual vs LatamPay (chart)
  - [ ] CTA: "Agenda demo 15 min" → Calendly

- [ ] 📝 **Copy ajustado a ICP**
  - [ ] Sección "Para quién": Agencias 5-30 personas
  - [ ] Sección "Dolor": Fees + conciliación manual
  - [ ] Sección "Solución": 3 pillars (Cobro, Fiscal, Suscripciones)
  - [ ] Testimonial placeholder (usar Design Partner futuro)

- [ ] 🔗 **CTAs y tracking**
  - [ ] Botón calculadora tracked (event: calculator_used)
  - [ ] Botón demo tracked (event: demo_requested)
  - [ ] Form email capture

**Deploy**:

- [ ] Preview URL compartida con 2-3 personas para feedback
- [ ] Deploy production si ok

**Tiempo estimado**: 4-5 horas  
**Blocker potencial**: Diseño/copy toma más tiempo → Usar template simple primero

---

### Día 3 - Miércoles 15 Nov

**Outbound Setup** (3-4 horas)

- [ ] 🔍 **Lista targeting (30 candidatos)**
  - [ ] LinkedIn search: "Founder" OR "Director" + "agencia" + "Colombia"
  - [ ] Filtros: 11-50 employees, Software/Marketing industry
  - [ ] Export a Google Sheet: Nombre, Cargo, Empresa, LinkedIn URL, País
  - [ ] Repetir para Argentina
  - [ ] Priorizar: Perfiles activos (posts recientes), English bio (clientes internacionales)

- [ ] ✍️ **Personalizar mensajes (10 mínimo)**
  - [ ] Template base de GTM_STRATEGY.md
  - [ ] Personalización: Mencionar algo específico de su perfil/empresa
  - [ ] Variable: Dolor específico (fees, retainers, fiscal)
  - [ ] CTA: Link calculadora o call directa

- [ ] 📤 **Enviar outreach**
  - [ ] 10 mensajes LinkedIn enviados
  - [ ] Tracking en Google Sheet: Fecha envío, Respuesta (Y/N), Stage

- [ ] 📄 **Design Partners charter**
  - [ ] Documento Google Docs con template de GTM_STRATEGY.md
  - [ ] Secciones: Compromiso, Contraprestación, KPIs, Duración
  - [ ] Preparar para firma digital (DocuSign o simple PDF + email)

**Tiempo estimado**: 3-4 horas  
**Meta mínima**: 10 mensajes enviados, 30 candidatos identificados

---

### Día 4 - Jueves 16 Nov

**Tech Setup** (4-5 horas)

- [ ] 📊 **PostHog setup**
  - [ ] Crear cuenta PostHog Cloud (free tier)
  - [ ] Install snippet en landing
  - [ ] Definir eventos custom:
    - `calculator_opened`
    - `calculator_completed`
    - `demo_requested`
    - `signup_started`
    - `invoice_created`
    - `payment_completed`
  - [ ] Test eventos en dev

- [ ] 💼 **Dev contractor search**
  - [ ] Job post Upwork: "Senior Hardhat + Next.js Developer"
  - [ ] Requirements: Web3 experience, OpenZeppelin, TypeScript, React
  - [ ] Budget: $3K/mes (20h/semana)
  - [ ] Timeline: Start ASAP, 3 meses inicial
  - [ ] Publicar post

- [ ] 🛠️ **V0 Scope lockdown**
  - [ ] GitHub Project: "V0 MVP"
  - [ ] Issues creados:
    - [ ] Smart contract permit implementation
    - [ ] Invoice creation UI
    - [ ] Payment link generation
    - [ ] Dashboard basic
    - [ ] Floor fee logic
  - [ ] Assign estimaciones (story points o horas)
  - [ ] Priorización en orden

**Tiempo estimado**: 4-5 horas  
**Blocker potencial**: Contractor search toma días → Empezar hoy para tener candidatos próxima semana

---

### Día 5 - Viernes 17 Nov

**First Retro** (2 horas)

- [ ] 📊 **Metrics review**
  - [ ] Update Google Sheet Week 1
  - [ ] Visitantes landing (analytics)
  - [ ] Leads generados (email captures)
  - [ ] Respuestas outreach
  - [ ] Progress V0 (% completado)

- [ ] 🎉 **Wins**
  - [ ] ¿Qué salió mejor de lo esperado?
  - [ ] ¿Qué aprendimos?
  - [ ] ¿Qué celebrar?

- [ ] 🚧 **Blockers**
  - [ ] ¿Qué nos detuvo?
  - [ ] ¿Decisiones pendientes?
  - [ ] ¿Recursos faltantes?

- [ ] 📅 **Next week plan**
  - [ ] Top 3 objetivos Semana 2
  - [ ] ¿Qué NO vamos a hacer?
  - [ ] Ajustes al plan

**Output**:

- [ ] Documento retro (Google Doc o Notion)
- [ ] Update OKRs en tracking sheet
- [ ] Decisiones log actualizado

**Tiempo estimado**: 2 horas  
**Timing**: Viernes 5pm ideal

---

## 📅 Semana 2: Primeros Contactos (Nov 20-26)

### Objetivos Semana 2

- [ ] 3 Design Partners contactados y con interés
- [ ] Landing con 50+ visitantes
- [ ] 5-10 leads email captured
- [ ] 2-3 demos agendadas
- [ ] V0 scope clarified con dev contractor

### Daily Cadence (Lunes-Viernes)

**Mañana (9am-12pm)**: Product/Dev

- Coordinar con dev contractor
- Product decisions pendientes
- Design reviews

**Tarde (2pm-5pm)**: GTM/Sales

- Outreach follow-ups
- Demos (si agendadas)
- Content creation

**Viernes 5pm**: Retro semanal

---

## 📅 Semana 3-4: MVP + Primeros DPs

### Objetivos Semanas 3-4

- [ ] V0 MVP deployed en testnet
- [ ] 5 Design Partners firmados
- [ ] Invoice demo prellenada funcional
- [ ] 3-5 trials activos (testnet)
- [ ] Fiscal básico spec definido para V1

---

## 📅 Semanas 5-8: V1 + Primeros Paying

### Objetivos Semanas 5-8

- [ ] V1 Fiscal básico deployed
- [ ] 10 Design Partners completados
- [ ] 5 paying customers (mainnet)
- [ ] $250-500 MRR
- [ ] Caso ahorro documentado (1 mínimo)

---

## 🎯 Milestones Mayores

### Mes 1 (Sem 1-4): Foundation

- [ ] ✅ Landing page optimizada
- [ ] ✅ 30+ candidatos outreach identificados
- [ ] ✅ 10 mensajes LinkedIn enviados
- [ ] ✅ V0 MVP deployed testnet
- [ ] ✅ 5 Design Partners firmados
- [ ] ✅ Tracking sheet actualizado semanal

**Success Metric**: 5 DPs + V0 testnet funcionando

---

### Mes 2 (Sem 5-8): First Customers

- [ ] V1 Fiscal básico validated
- [ ] 10 Design Partners activos
- [ ] 5-10 paying customers
- [ ] $500-800 MRR
- [ ] 1 caso éxito interno documentado

**Success Metric**: $500+ MRR + Trial→Payment >50%

---

### Mes 3 (Sem 9-12): PMF Signals

- [ ] 15 paying customers
- [ ] $1.5K MRR
- [ ] Caso éxito público (blog post + testimonial)
- [ ] Churn <10%
- [ ] Playbook GTM v1 documentado

**Success Metric**: PMF validado, replicable

---

### Q1 2026: Scale Machine

- [ ] 40 paying customers
- [ ] $5K MRR
- [ ] V2 Subscriptions deployed
- [ ] Growth plan launched
- [ ] CAC <$120 validated

**Success Metric**: Máquina conversión predecible

---

### Q4 2026: $100K MRR 🎯

- [ ] 600+ paying customers
- [ ] $100K+ MRR
- [ ] ARPU $200+
- [ ] 3 Enterprise contracts
- [ ] Seed fundraising ($1-2M) completado

**Success Metric**: Ready to scale 100 → 1,000

---

## 🚨 Red Flags Personal (Founder Health)

### Weekly Self-Check

**Burnout Signals** (marcar si aplican):

- [ ] Trabajando >60h/semana consistente
- [ ] No days off en 2+ semanas
- [ ] Sleep <6h regular
- [ ] Decisiones importantes postergadas por fatiga
- [ ] Irritabilidad/frustración alta

**Action si ≥3 marcados**:

- Tomar 1 día completo off esta semana
- Delegar tareas no-críticas
- Revisar prioridades (quizás menos frentes)
- Consider contratar help antes

---

### Monthly Energy Audit

**Pregunta mensual**: ¿Todavía creo en esto con la misma convicción?

- [ ] **Mes 1**: ¿El plan sigue teniendo sentido después de primeras conversaciones reales?
- [ ] **Mes 3**: ¿Los primeros customers validan la hipótesis o hay pivotes necesarios?
- [ ] **Mes 6**: ¿Los números (ARPU, churn, conversión) están en rango esperado?
- [ ] **Mes 12**: ¿Logramos $100K MRR o estamos cerca y path claro?

**Si respuesta es NO**: Retro profunda, considerar pivot o pause.

---

## 📊 Dashboard Personal (Mental Model)

### Cada Lunes Morning

**Pregunta**: ¿Qué DEBE pasar esta semana para considerarla exitosa?

Respuesta: [Max 3 cosas]

1.
2.
3.

---

### Cada Viernes Evening

**Pregunta**: ¿Logramos las 3 cosas críticas?

- [ ] Cosa 1: [Sí/No/Parcial]
- [ ] Cosa 2: [Sí/No/Parcial]
- [ ] Cosa 3: [Sí/No/Parcial]

**Si 2+ son "No"**: Algo está mal (priorización, capacidad, blockers). Ajustar plan.

---

## 🎯 Decisiones Clave Pendientes

### Ahora Mismo

1. **¿Acepto el plan completo o ajusto algo?**
   - [ ] Acepto al 100%
   - [ ] Ajusto: [detallar]
   - Decisión: ******\_\_\_******

2. **¿Contratar dev contractor inmediato?**
   - [ ] Sí, buscar hoy
   - [ ] No, bootstrap solo primeras semanas
   - Decisión: ******\_\_\_******

3. **¿Prioridad #1 próximos 7 días?**
   - [ ] Landing + Outreach (GTM)
   - [ ] V0 Development (Product)
   - [ ] Ambos 50/50
   - Decisión: ******\_\_\_******

---

### Próximas 2 Semanas

4. **¿Cuántos DPs mínimo para V0 launch?**
   - [ ] 3 mínimo
   - [ ] 5 ideal
   - [ ] 10 antes de mainnet
   - Decisión: ******\_\_\_******

5. **¿Target geográfico inicial?**
   - [ ] Solo Colombia
   - [ ] Solo Argentina
   - [ ] Ambos simultáneo
   - Decisión: ******\_\_\_******

---

## 📚 Recursos de Apoyo

### Documentos de Referencia

Cuando necesites:

- **Visión general**: MASTER_PLAN.md o EXECUTIVE_SUMMARY.md
- **Scripts ventas**: GTM_STRATEGY.md (sección 5)
- **Features roadmap**: PRODUCT_ROADMAP.md (versioning)
- **Métricas targets**: METRICS_TRACKING.md (sección 3)
- **ICP clarification**: GTM_STRATEGY.md (sección 1)

### Templates Útiles

- **Outreach message**: GTM_STRATEGY.md línea 150
- **Demo script**: GTM_STRATEGY.md línea 200
- **Email nurture**: GTM_STRATEGY.md línea 250
- **Weekly tracking**: METRICS_TRACKING.md línea 50
- **Design Partner charter**: GTM_STRATEGY.md línea 75

---

## ✅ Acceptance Criteria: Plan Ejecutado

### 30 Días

- [ ] 50+ visitantes landing
- [ ] 20+ leads captured
- [ ] 10+ mensajes outreach enviados
- [ ] 5 Design Partners firmados
- [ ] V0 deployed testnet
- [ ] Tracking actualizado semanal sin gaps

### 90 Días

- [ ] 10-15 paying customers
- [ ] $500-800 MRR
- [ ] Trial→Payment >50%
- [ ] 1 caso éxito documentado
- [ ] Churn <10%
- [ ] V1 Fiscal validated

### 12 Meses

- [ ] 100+ paying merchants
- [ ] $100K MRR
- [ ] ARPU $200+
- [ ] Churn <5%
- [ ] Seed fundraising ready

---

## 🎤 Mensaje de Cierre

```
Este checklist es tu compañero de ejecución.

No necesitas ser perfecto.
Necesitas ser consistente.

Marca ☑️ cada item.
Celebra cada milestone.
Ajusta cuando sea necesario.

El plan está hecho.
Ahora es execution time.

Score 4.6 → 7.1 → 8.0

Let's build. 🚀
```

---

**Created**: 2025-11-13  
**Owner**: Santiago Fragozo  
**Status**: 🟢 Ready to Execute  
**First Action**: Mark decisión tomada arriba ☑️
