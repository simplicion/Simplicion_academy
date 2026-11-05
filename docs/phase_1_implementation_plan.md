# Phase 1 Implementation Plan: Monorepo Setup, SAFS-04 Design System & DDD Foundation

**Document Version:** 1.0.0  
**Parent Master Plan:** [Master Multi-Tenant Platform Implementation Plan](./master_implementation_plan.md)  
**Conformance:** SAFS-00, SAFS-01, SAFS-02, SAFS-03, SAFS-04 (Design Standards), PRD Multi-Tenant Platform.  
**Execution Strategy:** **Frontend-First** (Design system & UI tokens first, followed by DDD domain packages, thin API layer, and automated test validation).

---

## 1. Objectives & Scope of Phase 1

Phase 1 establishes the unified codebase foundation for all applications and domains:
1. **Monorepo Architecture (`pnpm` workspace):**
   * Root orchestrator connecting `apps/*` and `packages/*`.
   * Standardized TypeScript configurations and build scripts.
2. **SAFS-04 Design System (`packages/ui`):**
   * Tokenized design architecture supporting both Simplicion branding (`#2563eb`) and dynamic white-label tenant themes (custom primary colors, border radii, fonts).
   * Core UI primitives: Button, Input, Badge, Card, Modal/Dialog, Tabs, Toast, and Layout Containers.
3. **Core Domain Packages (`packages/domain-*`):**
   * `@simplicion/domain-tenant`: Tenant aggregate, branding value objects, plan limits, domain routing rules.
   * `@simplicion/domain-catalog`: Offering, Unit, and Content item aggregates; pricing and discount value objects.
   * `@simplicion/domain-assessment`: Test, CBT exam invariants, question types, and scoring logic.
   * `@simplicion/domain-commerce`: Order aggregates, entitlement rules, split payment value objects.
   * `@simplicion/domain-identity`: User aggregate, OTP request lifecycle, roles, and tenant memberships.
4. **Multi-Tenant Data Persistence (`packages/db`):**
   * Full Prisma schema with mandatory `tenant_id` on all business entities.
   * Tenant-scoped client helpers preventing cross-tenant leakage.
5. **Thin API Delivery Layer (`apps/api`):**
   * Hostname resolution middleware (extracting tenant from subdomain or custom domain).
   * Thin route controllers forwarding requests directly to domain use-cases.
6. **Automated Test Suite:**
   * Unit tests for SAFS-04 token resolution, domain aggregates, and tenant isolation guards.

---

## 2. Directory Layout & Package Topology

```text
Simplicion_academy/
├── package.json                   (Root pnpm workspace configuration)
├── pnpm-workspace.yaml            (Defines apps/* and packages/*)
├── tsconfig.base.json             (Base TypeScript compiler options)
│
├── apps/
│   ├── api/                       (Thin API delivery layer - Express / Fastify)
│   │   ├── src/
│   │   │   ├── middleware/        (Tenant resolution, JWT verification)
│   │   │   ├── controllers/       (Thin request/response handlers)
│   │   │   └── index.ts           (Server entrypoint)
│   │   └── package.json
│   │
│   ├── student-portal/            (Scaffolded for Phase 2)
│   ├── teacher-portal/            (Scaffolded for Phase 4)
│   ├── admin-portal/              (Scaffolded for Phase 5)
│   └── docs-platform/             (Active Docusaurus standards platform)
│
└── packages/
    ├── ui/                        (SAFS-04 Design System & Tokens)
    │   ├── src/
    │   │   ├── tokens/            (Color tokens, spacing, typography, radii)
    │   │   ├── components/        (Button, Input, Badge, Card, Modal, Tabs)
    │   │   ├── theme/             (TenantThemeProvider, CSS variable injector)
    │   │   └── index.ts
    │   └── package.json
    │
    ├── domain-tenant/             (Tenant Aggregate, Branding, Subdomains)
    ├── domain-catalog/            (Offerings, Batches, Units, Content, Pricing)
    ├── domain-assessment/         (CBT Engine, Question Banks, Scorecards)
    ├── domain-commerce/           (Orders, Razorpay Splits, Entitlements)
    ├── domain-identity/           (Users, Phone OTP, Roles, Memberships)
    │
    └── db/                        (Prisma Multi-Tenant Schema & Client)
        ├── prisma/
        │   └── schema.prisma      (Full multi-tenant schema with tenant_id)
        ├── src/
        │   └── index.ts           (Tenant-scoped Prisma client proxy)
        └── package.json
```

---

## 3. Step-by-Step Execution Sequence

### Step 1: Workspace & Tooling Setup
- Create `pnpm-workspace.yaml` and root `package.json`.
- Configure `tsconfig.base.json` with strict type checking, path aliases, and modern ES features.

### Step 2: Build `@simplicion/ui` (SAFS-04 Frontend Package)
- Implement SAFS-04 design tokens:
  - Canonical palette (Simplicion Blue, Emerald Green, Amber Warning, Crimson Error).
  - Spacing scale, typography scale, radii scale, and elevation tokens.
- Build theme provider with CSS variable injection allowing teachers to dynamically override primary colors, border radii, and brand logos without a code rebuild.
- Build core component library (accessible via keyboard, WCAG 2.1 AA compliant).

### Step 3: Implement Domain Packages (DDD Business Logic)
- **`@simplicion/domain-tenant`**: Invariants for slug uniqueness, draft vs. published state, plan limits.
- **`@simplicion/domain-catalog`**: Offering lifecycle (Draft $\rightarrow$ Upcoming $\rightarrow$ Live $\rightarrow$ Archived), MRP vs Sale Price discount calculator, unit hierarchies.
- **`@simplicion/domain-assessment`**: CBT exam session timers, question state tracking (Answered/Marked/Review), score calculation.
- **`@simplicion/domain-commerce`**: Split calculation (platform fee vs teacher net), entitlement rule evaluation.
- **`@simplicion/domain-identity`**: 6-digit OTP generator, verification with attempt counter, session creation.

### Step 4: Multi-Tenant Prisma Schema (`@simplicion/db`)
- Write production-grade `schema.prisma` covering all PRD entities.
- Ensure every business model includes `@index([tenant_id])` and foreign keys.

### Step 5: Thin API Delivery Layer (`apps/api`)
- Build tenant resolution middleware:
  - Parses `req.headers.host` (e.g. `cuet.simplicion.com`, `cuetcoaching.com`, `localhost:3000`).
  - Resolves tenant and attaches to `req.tenant`.
- Wire thin endpoints calling the domain packages.

### Step 6: Automated Testing & Verification
- Unit test token generation and theme injection.
- Unit test domain aggregates (Pricing discount calculation, CBT score evaluation, OTP expiry).
- Integration test tenant resolution middleware with mocked hostnames.
- Cross-tenant isolation verification test.

