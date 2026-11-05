# Archived Legacy Single-Tenant Codebase

**Status:** Deprecated & Archived  
**Date:** 2026-11-05  
**Superseded By:** Simplicion Academy Multi-Tenant DDD Monorepo Architecture

---

## Notice
The files in this directory (`frontend/` and `backend/`) represent the original single-tenant prototype of the Academy platform.

They have been deprecated in favor of the production **Domain-Driven Design (DDD)** monorepo structure:
* **Presentation Apps:**
  * `apps/student-portal` (Next.js 14 App Router, dynamic SEO, Study Hub, bilingual NTA CUET CBT simulator)
  * `apps/teacher-portal` (No-code visual studio, curriculum tree manager, CBT question bank studio)
  * `apps/admin-portal` (Multi-tenant governance, KYC onboarding, Razorpay split settlements, audited impersonation)
* **Delivery Layer:**
  * `apps/api` (Thin Express gateway with zero business logic, hostname tenant resolution, signed JWTs, rate limiters)
* **Domain Layer:**
  * `packages/domain/assessment`
  * `packages/domain/catalog`
  * `packages/domain/commerce`
  * `packages/domain/identity`
  * `packages/domain/tenant`
* **Infrastructure Layer:**
  * `packages/db` (Multi-tenant scoped Prisma repository adapters)
  * `packages/ui` (SAFS-04 tokenized design system)

This archived directory is retained strictly for historical reference.

