# LatamPay Landing Page V1

Landing page creada siguiendo el plan estratégico para validar el ICP (agencias LATAM 5-30 personas que cobran clientes internacionales).

## 🎯 Objetivo

Que un fundador de agencia lea y diga **"Sí, esto me baja fees y trabajo manual"** en menos de 15 segundos.

## 📋 Secciones

### 1. **Hero**

- **Título**: "Cobra a tus clientes internacionales en dólares sin perder 3–6% en fees"
- **Subtítulo**: Facturas + pago estable en un clic + export fiscal
- **3 Bullet Proof**: Ahorra 60-80% en fees, flujo corporativo verificable, export fiscal listo
- **CTAs**: Calcular mi ahorro (primario) + Ver demo de 2 minutos (secundario)

### 2. **El Problema**

- Pérdida mensual: $450–$7,200 en fees
- Tiempo perdido: 4–12 horas/mes en conciliación
- Ejemplo concreto con volumen $28K/mes
- Visualización del dolor: fees, tiempo, fricción manual

### 3. **Cómo Funciona**

3 pasos simples:

1. Crear factura (cliente, monto, fecha)
2. Enviar link/QR de pago estable (one-click)
3. Confirmación instantánea + registro fiscal

### 4. **Ahorros Reales**

- **Calculadora interactiva** (ajustable por volumen y fee actual)
- **Caso estudio**: Agencia UX Medellín
  - Antes: $1,176/mes en fees + 7h admin
  - Después: $233/mes + 1.5h admin
  - **Ahorro: $943/mes (80%)** + 78% menos tiempo

### 5. **Pricing**

Tres planes claros:

- **Free**: 10 facturas/mes, prueba el flujo
- **Pro** ($49/mes): Ilimitado, fiscal básico, one-click, soporte 48h ⭐ Más popular
- **Growth** ($119/mes): + Suscripciones, webhooks, analítica, soporte 24h

Fee transparente: **0.3%** por transacción + $0.25 mínimo

### 6. **Por qué Ahora**

- Stablecoins = dólares digitales (1:1 respaldado)
- Liquidez 24/7 sin horarios bancarios
- Confirmación instantánea (2 seg en Polygon)
- Urgencia: cada día sigues perdiendo $1,200+ en fees

### 7. **Design Partners**

- **Buscando 10 Design Partners**
- Oferta: 6 meses Growth GRATIS ($714 valor) + prioridad roadmap
- Perfil ideal: Agencias 5-30 personas, clientes internacionales, $15K-$120K/mes
- CTA: Aplicar como Design Partner (link a Calendly)

### 8. **Footer**

- Links producto, empresa, legal
- **Disclaimer non-custodial**: LatamPay no custodia fondos, pagos directos wallet-to-wallet
- Redes sociales: Twitter, GitHub, LinkedIn
- Badge: "Powered by Polygon Network"

## 🚀 Ejecutar en desarrollo

```bash
cd apps/dashboard
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🎨 Stack Técnico

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 3.4+
- **Componentes**: React 18 con Server Components
- **Despliegue**: Vercel (recomendado)

## 📊 Tracking Events

Eventos clave para implementar con PostHog:

- `calculator_opened`: Usuario interactúa con calculadora
- `calculator_completed`: Usuario completa cálculo de ahorro
- `demo_requested`: Click en "Ver demo"
- `signup_started`: Click en CTAs principales
- `design_partner_applied`: Click en aplicar Design Partner

## ✅ Checklist Validación (Semana 1)

- [x] Landing page estructura completa
- [x] Calculadora interactiva funcionando
- [x] Messaging optimizado para ICP
- [x] CTAs claros y accionables
- [ ] Deploy en Vercel/producción
- [ ] Setup PostHog tracking
- [ ] Integrar Calendly para demos
- [ ] A/B test headlines (opcional)

## 🎯 Métricas Objetivo (30 días)

- 50+ visitantes landing
- 20+ leads email captured
- 10+ cálculos completados en calculadora
- 5+ solicitudes demo/Design Partners
- Conversión visitante → lead: **20%+**

## 📝 Próximos Pasos

1. **Deploy producción** (Vercel, dominio custom)
2. **Setup analytics** (PostHog + Google Analytics)
3. **Integrar Calendly** para booking demos
4. **Crear video demo 2 min** (Loom/YouTube)
5. **LinkedIn outreach** con link a calculadora
6. **A/B testing** headlines (optional, después de 100+ visits)

## 🔗 Referencias

- [GTM_STRATEGY.md](../../GTM_STRATEGY.md) - Estrategia completa go-to-market
- [PRODUCT_ROADMAP.md](../../PRODUCT_ROADMAP.md) - Roadmap features V0-V4
- [MASTER_PLAN.md](../../MASTER_PLAN.md) - Plan integrado 0→$100K MRR
- [FOUNDER_CHECKLIST.md](../../FOUNDER_CHECKLIST.md) - Lista verificación semanal

---

**Creado**: Nov 13, 2025  
**Owner**: Santiago Fragozo  
**Status**: ✅ V1 Completado - Listo para deploy
