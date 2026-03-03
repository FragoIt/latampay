# RENTAZT
## Brief Ejecutivo para Junta Directiva
### Febrero 2026

---

# 1. RESUMEN EJECUTIVO

**Rentazt** es una plataforma SaaS especializada en gestión de inventarios y rentas para empresas de alquiler de equipos para eventos. Transforma operaciones manuales fragmentadas en flujos digitales automatizados, eliminando pérdidas por inventario no rastreado, penalidades no cobradas y clientes morosos.

| Métrica Clave | Valor |
|---------------|-------|
| Mercado Objetivo | Empresas de renta de equipos para eventos en LATAM |
| Modelo de Negocio | SaaS B2B con suscripción mensual |
| Ticket Promedio | $200-500 USD/mes |
| TAM Estimado (LATAM) | ~$180M USD anuales |
| Estado Actual | MVP funcional listo para pilotos |

---

# 2. DEFINICIÓN DEL PROBLEMA

## 2.1 El Dolor del Mercado

Las empresas de renta de equipos para eventos (sonido, iluminación, mobiliario, carpas, escenografía) operan con:

1. **Control de inventario en Excel o papel** — Pérdidas por equipos extraviados estimadas en 8-15% del valor total anual
2. **Cobro manual de penalidades** — El 40% de las multas por devolución tardía nunca se cobran
3. **Sin historial crediticio de clientes** — Repiten alquileres a morosos sin visibilidad
4. **Comunicación fragmentada** — WhatsApp personal sin trazabilidad

## 2.2 Consecuencias Financieras

Para una empresa típica con inventario valorado en $100,000 USD:

| Fuga de Valor | Impacto Anual |
|---------------|---------------|
| Equipos perdidos/dañados | -$8,000 a -$15,000 |
| Penalidades no cobradas | -$3,000 a -$6,000 |
| Clientes morosos repetidos | -$2,000 a -$4,000 |
| **Total pérdida evitable** | **-$13,000 a -$25,000** |

> **Insight estratégico**: El costo de Rentazt ($2,400-$6,000/año) representa entre 10-25% del valor recuperable. ROI proyectado: **4x-10x**.

---

# 3. PROPUESTA DE VALOR

## 3.1 Core Value Proposition

> **"Rentazt convierte el caos operativo de las rentas en un sistema predictivo que maximiza la utilización de activos y elimina fugas de efectivo."**

## 3.2 Diferenciadores Clave

| Capacidad | Beneficio |
|-----------|-----------|
| **Inventario en tiempo real** | Saber exactamente qué está disponible, qué está afuera, y qué está en mantenimiento |
| **Checkout/Return digitalizado** | Registro inmediato de salidas y devoluciones con auditoría completa |
| **Penalidades automáticas** | Cálculo y registro automático de multas por atraso (150% tarifa diaria) |
| **Credit Scoring de clientes** | Historial de comportamiento para decisiones de riesgo |
| **Alertas WhatsApp** | Recordatorios de devolución y resúmenes semanales |

## 3.3 Jobs-To-Be-Done

| Rol | Job | Solución Rentazt |
|-----|-----|------------------|
| **Dueño de Negocio** | Saber cuánto dinero tengo en la calle | Dashboard con métricas de cobro pendiente |
| **Operador de Almacén** | Registrar salidas/entradas rápido | Flujo de checkout en 3 clicks |
| **Administrador** | Identificar clientes problemáticos | Score crediticio visual |
| **Contador** | Conciliar rentas vs pagos | Reportes de ingresos por período |

---

# 4. ARQUITECTURA TÉCNICA

## 4.1 Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Frontend** | Next.js 14, React 18, TailwindCSS | Performance, SEO, DX moderno |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime) | Escalabilidad serverless, RLS nativo |
| **Infraestructura** | Vercel + Supabase Cloud | Zero-ops, auto-scaling, edge deployment |
| **Integraciones** | Twilio WhatsApp API | Comunicación automatizada |

## 4.2 Modelo de Datos

```
┌─────────────────┐       ┌─────────────────┐
│     clients     │       │ inventory_items │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │       │ user_id (FK)    │
│ name            │       │ name, sku       │
│ phone, email    │       │ category        │
│ credit_score    │◄──┐   │ daily_rate      │
│ created_at      │   │   │ qty_total       │
└─────────────────┘   │   │ qty_available   │
                      │   └────────┬────────┘
                      │            │
┌─────────────────┐   │   ┌────────▼────────┐
│     rentals     │───┘   │  rental_items   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ rental_id (FK)  │
│ client_id (FK)  │       │ item_id (FK)    │
│ start_date      │       │ quantity        │
│ end_date        │       │ daily_rate_snap │
│ total_amount    │       └─────────────────┘
│ penalty_amount  │
│ status          │       ┌─────────────────┐
│ payment_status  │       │  movement_log   │
└─────────────────┘       ├─────────────────┤
                          │ rental_id (FK)  │
                          │ item_id (FK)    │
                          │ action (enum)   │
                          │ quantity        │
                          │ created_at      │
                          └─────────────────┘
```

## 4.3 Seguridad Multi-Tenant

Implementación de **Row Level Security (RLS)** en PostgreSQL:
- Cada usuario solo accede a sus propios datos
- Políticas granulares por tabla y operación
- Aislamiento completo entre organizaciones

---

# 5. ESTADO DEL PRODUCTO

## 5.1 Funcionalidades Implementadas (MVP)

| Módulo | Funcionalidad | Estado |
|--------|---------------|--------|
| **Dashboard** | KPIs, alertas próximas devoluciones, actividad reciente | ✅ Completo |
| **Inventario** | CRUD equipos, categorías, disponibilidad visual | ✅ Completo |
| **Clientes** | CRUD clientes, credit score, historial | ✅ Completo |
| **Rentas** | Checkout flow, return flow, penalidades auto | ✅ Completo |
| **Reportes** | Revenue, utilización, top clientes | ✅ Completo |
| **Auth** | Magic Link login, sesiones seguras | ✅ Heredado |

## 5.2 Roadmap Inmediato

| Q1 2026 | Q2 2026 | Q3 2026 |
|---------|---------|---------|
| Pilotos con 3-5 empresas | WhatsApp automation | App móvil operador |
| Refinamiento UX | Facturación electrónica | Integraciones contables |
| Landing page comercial | Multi-usuario por org | API pública |

---

# 6. MODELO DE NEGOCIO

## 6.1 Pricing Strategy

| Tier | Precio/mes | Usuarios | Equipos | Target |
|------|------------|----------|---------|--------|
| **Starter** | $199 USD | 2 | 200 | Pequeñas empresas familiares |
| **Professional** | $349 USD | 5 | 1,000 | Empresas medianas |
| **Enterprise** | $499+ USD | Ilimitados | Ilimitados | Operaciones grandes |

## 6.2 Unit Economics (Proyección Año 1)

| Métrica | Valor |
|---------|-------|
| CAC estimado | $150 USD |
| LTV (24 meses avg) | $6,000 USD |
| LTV:CAC Ratio | 40:1 |
| Churn esperado | <5% mensual |
| Payback period | <1 mes |

## 6.3 Go-to-Market

1. **Pilotos directos** — Empresas conocidas del ecosistema (3-5 iniciales)
2. **Referral program** — 1 mes gratis por cada referido convertido
3. **Content marketing** — Calculadora de pérdidas, casos de éxito
4. **Partnerships** — Asociaciones de eventos, proveedores de audio/iluminación

---

# 7. ANÁLISIS COMPETITIVO

| Solución | Fortaleza | Debilidad | Posición Rentazt |
|----------|-----------|-----------|------------------|
| **ERPs genéricos** (SAP, Odoo) | Completos | Costosos, complejos, no especializados | Especialización + simplicidad |
| **Hojas de cálculo** | Gratis | Sin automatización, error humano | Automatización + historial |
| **Software rental genérico** (US/EU) | Funcionalidad | Pricing USD alto, sin soporte LATAM | Precio local + soporte en español |

> **Ventaja competitiva**: Rentazt es la única solución diseñada **por y para** el mercado latinoamericano de rentas de eventos.

---

# 8. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Adopción lenta por resistencia digital | Media | Alto | Onboarding asistido, UI extremadamente simple |
| Competidor copia modelo | Baja | Medio | First-mover advantage, relaciones directas |
| Dependencia de Supabase | Baja | Alto | Arquitectura portable, PostgreSQL estándar |
| Escalabilidad técnica | Baja | Medio | Edge deployment, database pooling |

---

# 9. SOLICITUD A LA JUNTA

## 9.1 Inversión Requerida

| Concepto | Monto |
|----------|-------|
| Desarrollo adicional (3 meses) | $15,000 USD |
| Infraestructura (12 meses) | $3,600 USD |
| Marketing inicial | $5,000 USD |
| Operaciones piloto | $2,400 USD |
| **Total** | **$26,000 USD** |

## 9.2 Hitos de Validación

| Mes | Hito | Métrica de Éxito |
|-----|------|------------------|
| 1 | 3 pilotos activos | NPS > 50 |
| 3 | Primer cliente de pago | $199+ MRR |
| 6 | 10 clientes activos | $2,500+ MRR |
| 12 | 30 clientes, break-even | $8,000+ MRR |

---

# 10. CONCLUSIÓN

Rentazt representa una oportunidad de mercado clara con:
- ✅ Problema validado y cuantificable
- ✅ MVP funcional listo para pilotos
- ✅ Modelo de negocio con unit economics atractivos
- ✅ Equipo técnico capaz de iterar rápidamente
- ✅ Mercado desatendido en LATAM

**Recomendación**: Aprobar inversión inicial para fase de pilotaje y validación comercial.

---

*Documento preparado para Junta Directiva — Febrero 2026*
*Confidencial — No distribuir externamente*
