# Phase 7 Implementation Plan: Persistence & Repository Ports (`packages/db`)

## 1. Executive Summary & Objectives
Phase 7 bridges the **Domain-Driven Design (DDD)** domain models with **concrete persistence infrastructure**. In strict conformance with Hexagonal Architecture and **SAFS-02 Multi-Tenancy & Data Standards**, Phase 7 defines clean **Domain Repository Ports (Interfaces)** inside our domain packages and implements **Concrete Prisma Repository Adapters** in `packages/db`.

Every database query and mutation is strictly wrapped with tenant context enforcement to guarantee **zero cross-tenant data leakage** at the data layer.

---

## 2. Hexagonal Architectural Blueprint

```mermaid
flowchart TD
    subgraph DomainPorts ["Domain Packages (packages/domain/*) - Ports"]
        ITenantRepo["ITenantRepository<br/>(findBySlug, findById, save)"]
        IOfferingRepo["IOfferingRepository<br/>(findPublicByTenant, findById, save)"]
        IOrderRepo["IOrderRepository<br/>(findById, findByGatewayId, save)"]
        IUserRepo["IUserRepository<br/>(findByPhone, findById, save)"]
        IAssessRepo["IAssessmentRepository<br/>(findQuestionsByUnit, findTestById, saveScorecard)"]
    end

    subgraph DatabaseAdapters ["packages/db (Adapters)"]
        PrismaTenant["PrismaTenantRepository"]
        PrismaOffering["PrismaOfferingRepository"]
        PrismaOrder["PrismaOrderRepository"]
        PrismaUser["PrismaUserRepository"]
        PrismaAssess["PrismaAssessmentRepository"]
        TenantGuard["enforceTenantScope Guard (SAFS-02)"]
    end

    subgraph Persistence ["PostgreSQL / Prisma Client"]
        PrismaClient["Prisma Client with Tenant Filters"]
        SeedData["prisma/seed.ts (Reference Tenant & Batches)"]
    end

    ITenantRepo <|.. PrismaTenant
    IOfferingRepo <|.. PrismaOffering
    IOrderRepo <|.. PrismaOrder
    IUserRepo <|.. PrismaUser
    IAssessRepo <|.. PrismaAssess

    PrismaTenant --> TenantGuard
    PrismaOffering --> TenantGuard
    PrismaOrder --> TenantGuard
    PrismaUser --> TenantGuard
    PrismaAssess --> TenantGuard

    TenantGuard --> PrismaClient
    SeedData --> PrismaClient
```

---

## 3. Core Modules & Step-by-Step Implementation

### Module 7.1: Domain Repository Ports (`packages/domain/*`)
Declare clean repository interfaces without any dependency on Prisma or SQL:
1. **`packages/domain/tenant/src/repository.ts`**:
   - `ITenantRepository`: `findById(id)`, `findBySlug(slug)`, `findByCustomDomain(domain)`, `save(tenant)`.
2. **`packages/domain/catalog/src/repository.ts`**:
   - `IOfferingRepository`: `findById(tenantId, id)`, `findBySlug(tenantId, slug)`, `findActiveByTenant(tenantId)`, `save(offering)`.
3. **`packages/domain/commerce/src/repository.ts`**:
   - `IOrderRepository`: `findById(tenantId, id)`, `findByGatewayOrderId(gatewayOrderId)`, `findByUserId(tenantId, userId)`, `save(order)`.
4. **`packages/domain/identity/src/repository.ts`**:
   - `IUserRepository`: `findById(id)`, `findByPhone(tenantId, phone)`, `save(user)`.
5. **`packages/domain/assessment/src/repository.ts`**:
   - `IAssessmentRepository`: `findQuestionsByUnit(tenantId, unitId)`, `saveScorecard(scorecard)`.

### Module 7.2: Concrete Prisma Adapters with Multi-Tenant Enclosure (`packages/db`)
Implement the interfaces with automatic `tenant_id` injection:
- Every query mandates `context.tenantId`.
- Every mutation executes `enforceTenantScope(payload, context)`.
- If an entity belonging to `tenant_A` is requested under `tenant_B` context, the repository returns `null` or throws a security violation error.

### Module 7.3: Multi-Tenant Database Seeder (`packages/db/prisma/seed.ts`)
Creates standard baseline data for local and staging environments:
- **Reference Tenant**:
  - Name: "Humanities CUET Academy"
  - Slug: `cuet-humanities`
  - Domain: `cuethumanities.in`
  - Plan: `plan_pro` (3% platform fee, custom domain enabled, 1,500 student cap)
- **Batches & Offerings**:
  - "CUET 2027: Humanities Foundation Batch" (MRP ₹9,999, Sale ₹4,999, 50% OFF)
  - "CUET History Domain Intensive Crash Course" (MRP ₹3,999, Sale ₹1,999)
- **Curriculum & CBT Mocks**:
  - Unit 1: "Bricks, Beads and Bones - The Harappan Civilisation"
  - 25 authentic CUET Humanities questions with bilingual Hindi/English prompts and +4 / -1 scoring rules.

---

## 4. Testing & Verification Plan

| Test File | Target Scope |
|---|---|
| `packages/db/test/prisma-repositories.test.ts` | Validates CRUD operations across all 5 repository adapters, verifying data mapping between database records and domain aggregates. |
| `packages/db/test/tenant-isolation-boundary.test.ts` | Strictly asserts that attempting to read or update records belonging to `tenant_A` using `tenant_B` context fails with hard security violation. |

---

## 5. Execution Order

1. **Step 1**: Define Domain Repository Ports in `packages/domain/{tenant, catalog, commerce, identity, assessment}`.
2. **Step 2**: Implement Concrete Multi-Tenant Repository Adapters in `packages/db/src/repositories/`.
3. **Step 3**: Create executable database seed script in `packages/db/prisma/seed.ts`.
4. **Step 4**: Write automated repository test suites in `packages/db/test/`.
5. **Step 5**: Execute full test suite across the monorepo and verify 100% pass rate.

