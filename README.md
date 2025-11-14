# LatamPay Monorepo

Monorepo completo para LatamPay con Smart Contracts, SDK, API, Dashboard y Documentación.

## 📁 Estructura del Proyecto

```
latampay/
├── apps/
│   ├── contracts/      # Smart contracts Solidity
│   ├── sdk/            # SDK TypeScript para npm
│   ├── api/            # Backend API (Express + Prisma)
│   ├── dashboard/      # Dashboard SaaS (Next.js)
│   └── docs/           # Documentación (Docusaurus)
├── packages/
│   ├── config/         # Shared config (ESLint, TS)
│   └── types/          # Shared TypeScript types
└── package.json        # Root workspace
```

## 🚀 Requisitos Previos

- **Node.js**: v20.0.0 o superior
- **pnpm**: v8.0.0 o superior

## 📦 Instalación

1. **Instalar pnpm** (si no lo tienes):

```bash
npm install -g pnpm@8.15.0
```

2. **Clonar el repositorio** (si aplica):

```bash
git clone <repository-url>
cd latampay
```

3. **Instalar dependencias**:

```bash
pnpm install
```

4. **Generar cliente de Prisma** (para la API):

```bash
cd apps/api
pnpm db:generate
cd ../..
```

## 🛠️ Scripts Disponibles

### Desde la raíz del proyecto:

- `pnpm build` - Construye todos los proyectos
- `pnpm dev` - Ejecuta todos los proyectos en modo desarrollo
- `pnpm lint` - Ejecuta ESLint en todos los proyectos
- `pnpm format` - Formatea el código con Prettier
- `pnpm type-check` - Verifica tipos TypeScript en todos los proyectos
- `pnpm clean` - Limpia todos los builds y node_modules

### Scripts por aplicación:

#### Contracts (`apps/contracts`)

- `pnpm build` - Compila los smart contracts
- `pnpm dev` - Inicia Hardhat node local
- `pnpm lint` - Ejecuta ESLint
- `pnpm type-check` - Verifica tipos TypeScript
- `pnpm clean` - Limpia los archivos compilados

#### SDK (`apps/sdk`)

- `pnpm build` - Construye el SDK (CJS + ESM)
- `pnpm dev` - Modo watch para desarrollo
- `pnpm lint` - Ejecuta ESLint
- `pnpm type-check` - Verifica tipos TypeScript
- `pnpm clean` - Limpia el directorio dist

#### API (`apps/api`)

- `pnpm build` - Compila TypeScript
- `pnpm dev` - Ejecuta en modo desarrollo con hot reload
- `pnpm start` - Ejecuta la versión compilada
- `pnpm lint` - Ejecuta ESLint
- `pnpm type-check` - Verifica tipos TypeScript
- `pnpm db:generate` - Genera el cliente de Prisma
- `pnpm db:migrate` - Ejecuta migraciones de base de datos
- `pnpm db:studio` - Abre Prisma Studio
- `pnpm clean` - Limpia el directorio dist

#### Dashboard (`apps/dashboard`)

- `pnpm build` - Construye la aplicación Next.js
- `pnpm dev` - Ejecuta en modo desarrollo (puerto 3000)
- `pnpm start` - Ejecuta la versión de producción
- `pnpm lint` - Ejecuta Next.js lint
- `pnpm type-check` - Verifica tipos TypeScript
- `pnpm clean` - Limpia .next y out

#### Docs (`apps/docs`)

- `pnpm build` - Construye la documentación estática
- `pnpm dev` - Ejecuta Docusaurus en modo desarrollo
- `pnpm start` - Ejecuta Docusaurus
- `pnpm lint` - Ejecuta ESLint
- `pnpm type-check` - Verifica tipos TypeScript
- `pnpm clean` - Limpia build y .docusaurus

## 🔧 Configuración

### pnpm Workspaces

El monorepo usa pnpm workspaces para gestionar múltiples packages. La configuración está en `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Turborepo

Turborepo está configurado para optimizar las builds y ejecuciones. La configuración está en `turbo.json`:

- **Build**: Depende de builds anteriores (`^build`)
- **Dev**: Modo persistente sin caché
- **Lint**: Depende de lint anteriores (`^lint`)
- **Type-check**: Depende de type-check anteriores (`^type-check`)

### TypeScript Paths

Los paths de TypeScript están configurados para permitir imports entre packages:

```typescript
import { User, Payment } from '@latampay/types';
import { eslintPreset } from '@latampay/config';
```

Los paths están configurados en cada `tsconfig.json` y permiten importar packages internos sin rutas relativas. El archivo raíz `tsconfig.json` define los paths base:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@latampay/types": ["./packages/types/src"],
      "@latampay/config": ["./packages/config"]
    }
  }
}
```

### ESLint + Prettier

El monorepo usa ESLint y Prettier para mantener la consistencia del código:

- **ESLint**: Configuración compartida en `packages/config/eslint-preset.js`
  - Extiende: `eslint:recommended`, `@typescript-eslint/recommended`, `prettier`
  - Cada app/package tiene su propio `.eslintrc.js` que extiende `@latampay/config`
- **Prettier**: Configuración en `.prettierrc` en la raíz
  - Archivos ignorados en `.prettierignore`

Para formatear el código:

```bash
pnpm format
```

Para verificar linting:

```bash
pnpm lint
```

### Variables de Entorno

Crea archivos `.env` en cada app según sea necesario:

- `apps/api/.env` - Variables para la API (DATABASE_URL, etc.)
- `apps/dashboard/.env.local` - Variables para Next.js
- `apps/contracts/.env` - Variables para Hardhat

**Nota**: Los archivos `.env*.local` están en `.gitignore` y no se commitean.

## 📚 Tecnologías Utilizadas

- **Monorepo**: Turborepo + pnpm workspaces
- **Smart Contracts**: Hardhat + Solidity
- **SDK**: TypeScript + tsup
- **API**: Express + Prisma + TypeScript
- **Dashboard**: Next.js 14 + React 18
- **Docs**: Docusaurus 3
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript 5.3+

## 🏗️ Desarrollo

### Ejecutar una app específica:

```bash
# Desde la raíz usando pnpm filter
pnpm --filter @latampay/api dev

# O desde el directorio de la app
cd apps/api
pnpm dev
```

### Ejecutar múltiples apps:

```bash
# Ejecutar solo API y Dashboard
pnpm --filter @latampay/api --filter @latampay/dashboard dev
```

### Agregar una nueva dependencia:

```bash
# A una app específica
pnpm --filter @latampay/api add express

# A todas las apps (workspace root)
pnpm add -w -D typescript

# A un package específico
pnpm --filter @latampay/types add zod
```

### Construir solo un proyecto:

```bash
pnpm --filter @latampay/sdk build
```

### Limpiar un proyecto específico:

```bash
pnpm --filter @latampay/api clean
```

## 📝 Convenciones

- Usa `workspace:*` para referenciar packages internos en `package.json`
- Los tipos compartidos van en `packages/types`
- Las configuraciones compartidas van en `packages/config`
- Cada app tiene su propio `tsconfig.json` que extiende el root
- Todos los packages deben tener scripts básicos: `build`, `dev`, `lint`, `type-check`, `clean`
- Los nombres de los packages siguen el patrón `@latampay/<nombre>`

## 🔍 Estructura de Archivos de Configuración

```
latampay/
├── .gitignore          # Archivos ignorados por Git
├── .prettierrc         # Configuración de Prettier
├── .prettierignore     # Archivos ignorados por Prettier
├── pnpm-workspace.yaml # Configuración de pnpm workspaces
├── turbo.json          # Configuración de Turborepo
├── tsconfig.json       # Configuración base de TypeScript
└── package.json        # Scripts y dependencias del root
```

---

## 📋 Documentación Estratégica

Este monorepo incluye documentación completa para la ejecución del proyecto:

### 🎯 Plan Maestro

- **[MASTER_PLAN.md](./MASTER_PLAN.md)** - Plan integral de ejecución (Score 6.6 → 8.0)
  - Análisis conceptual completo
  - Modelo de monetización multi-capa
  - Timeline 12 meses: 0 → $100K MRR
  - Unit economics y proyecciones

### 🚀 Go-To-Market

- **[GTM_STRATEGY.md](./GTM_STRATEGY.md)** - Estrategia comercial 0→100 merchants
  - ICP ultra-específico (Agencias LATAM 5-30 personas)
  - Design Partners: 10 contratos con charter
  - Embudo conversión cuantificado
  - Scripts: Outbound, Demo, Email nurture
  - Canales: LinkedIn, Webinars, Referral

### 🛠️ Product Roadmap

- **[PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)** - Roadmap técnico sin feature sprawl
  - Versioning: V0 (MVP) → V4 (Enterprise)
  - Impact Score framework
  - Feature specs: Fiscal, Subscriptions, White-label
  - Anti-sprawl rules: Max 2 frentes complejos

### 📊 Métricas & Tracking

- **[METRICS_TRACKING.md](./METRICS_TRACKING.md)** - Dashboard y OKRs
  - North Star: MAP, MRR, GMV
  - Weekly tracking template
  - Red flags & umbrales decisionales
  - OKRs Q4 2025 - Q4 2026
  - Unit economics calculators

### 🔧 Implementación Técnica

- **[IMPLEMENTATION_PLAN_PERMIT.md](./IMPLEMENTATION_PLAN_PERMIT.md)** - Plan EIP-2612 One-Click Pay
- **[RESUMEN_PLAN_PERMIT.md](./RESUMEN_PLAN_PERMIT.md)** - Resumen ejecutivo (español)
- **[QUICK_REFERENCE_PERMIT.md](./QUICK_REFERENCE_PERMIT.md)** - Referencia rápida
- **[INDEX_PLAN_PERMIT.md](./INDEX_PLAN_PERMIT.md)** - Índice navegación

---

## 🎯 Quickstart Estratégico

Si eres nuevo en el proyecto, lee en este orden:

1. **[MASTER_PLAN.md](./MASTER_PLAN.md)** - Visión general y estrategia
2. **[GTM_STRATEGY.md](./GTM_STRATEGY.md)** - Cómo adquirir primeros 100 merchants
3. **[PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)** - Qué construir y cuándo
4. Este README - Setup técnico del monorepo

---

## 🤝 Contribuir

1. Crea una rama desde `main`
2. Realiza tus cambios
3. Ejecuta `pnpm lint` y `pnpm type-check` para verificar
4. Ejecuta `pnpm format` para formatear el código
5. Asegúrate de que todos los tests pasen (si aplica)
6. Crea un Pull Request

## 📄 Licencia

[Tu licencia aquí]
