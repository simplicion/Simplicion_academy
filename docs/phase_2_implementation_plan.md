# Phase 2 Implementation Plan: Student Portal Storefront & SEO Engine

**Document Version:** 1.0.0  
**Parent Master Plan:** [Master Multi-Tenant Platform Implementation Plan](./master_implementation_plan.md)  
**Conformance:** SAFS-00, SAFS-01, SAFS-03, SAFS-04 (Design Standards), PRD FR-STU, FR-SEO, FR-CAT.  
**Execution Strategy:** **Frontend-First** (Storefront UI, dynamic homepage sections, SEO metadata engine, offering checkout landing, OTP login modal, followed by automated test validation).

---

## 1. Objectives & Scope of Phase 2

Phase 2 builds the student-facing public storefront and discovery experience in `apps/student-portal`:
1. **Next.js App Router Application (`apps/student-portal`):**
   * Multi-tenant storefront resolving tenant branding and configuration from `@simplicion/tenant` and `@simplicion/catalog`.
   * Integrates `@simplicion/ui` design system and tokens.
2. **SEO & Discoverability Engine (FR-SEO):**
   * Dynamic `<title>` and `<meta name="description">` generated per tenant with teacher institute name and subject keywords.
   * Automated Schema.org JSON-LD generation:
     * `Organization` Schema on homepage.
     * `Course` Schema on every Offering page.
     * `FAQPage` Schema on homepage FAQ section.
   * Dynamic `/sitemap.xml` and `/robots.txt` generators.
3. **Homepage Builder Render Engine:**
   * Interprets tenant's `sectionsOrder` configuration:
     * **Hero Section:** Teacher logo, dynamic tagline ("Humanities walon, tum kisi se kam nahi"), and configurable Login/Register position.
     * **Upcoming Offerings Carousel:** Auto-sliding banner showcasing upcoming batches with direct deep-links.
     * **Category Explorer:** Category cards with "More Explore" modal; empty categories show "Coming Soon" with "Notify Me" lead capture.
     * **Why-Us & Features Grid:** Icon + highlight text.
     * **Faculty & Testimonials Section:** Teacher bio, student results, and trust badges.
     * **FAQ Accordion:** Interactive questions & answers.
4. **Offering Landing & Checkout Page (`/o/:slug`):**
   * Struck-through MRP, calculated discount badge (e.g. `50% OFF`), feature list, unit breakdown, downloadable syllabus PDF link, and sticky bottom enrollment bar.
5. **Phone OTP Authentication Modal:**
   * 6-digit numeric OTP input with 30s resend timer, attempt counter, and post-login student Welcome tag.
6. **Automated Testing Suite:**
   * Tests for SEO Schema.org generation, metadata generation, discount badge calculations, and storefront rendering.

---

## 2. Directory Structure (`apps/student-portal`)

```text
apps/student-portal/
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.js
│
├── src/
│   ├── app/
│   │   ├── layout.tsx             (Root layout with dynamic tenant theme CSS injection)
│   │   ├── page.tsx               (Dynamic homepage builder renderer)
│   │   ├── o/[slug]/page.tsx      (Offering detail & checkout page)
│   │   ├── c/[slug]/page.tsx      (Category explorer page)
│   │   ├── sitemap.ts             (Dynamic sitemap generator)
│   │   └── robots.ts              (Dynamic robots.txt generator)
│   │
│   ├── components/
│   │   ├── Header.tsx             (Tenant branding & Welcome tag)
│   │   ├── Footer.tsx             (Tenant contact, policies, WhatsApp)
│   │   ├── HeroSection.tsx        (Hero banner & CTA)
│   │   ├── OfferingsSlider.tsx    (Upcoming batches carousel)
│   │   ├── CategoryExplorer.tsx   (Category cards & Notify Me)
│   │   ├── WhyUsSection.tsx       (Features & faculty credentials)
│   │   ├── FaqSection.tsx         (FAQ accordion)
│   │   ├── OfferingDetail.tsx     (Price card, syllabus, sticky CTA)
│   │   └── AuthModal.tsx          (Phone OTP verification dialog)
│   │
│   └── lib/
│       ├── seo.ts                 (Schema.org JSON-LD builders)
│       └── tenant-data.ts         (Reference tenant loader: Humanities CUET)
│
└── test/
    ├── seo.test.ts                (Schema.org & metadata tests)
    └── storefront.test.ts         (Offering pricing & layout tests)
```

---

## 3. Step-by-Step Execution Sequence

1. **Scaffold `apps/student-portal`:** Configure Next.js App Router, Tailwind CSS with `@simplicion/ui` tokens, and package dependencies.
2. **Implement Reference Tenant Data & Mock Engine:** Pre-populate the Humanities CUET reference data (Section 9 of PRD) to verify end-to-end rendering without hardcoding.
3. **Build SEO & Schema Engine (`src/lib/seo.ts`):** Structured data generators for `Organization`, `Course`, `FAQPage`.
4. **Build Storefront Components:** Header with dynamic login alignment, Hero section, Offerings Slider, Category Explorer with "Notify Me" dialog, FAQ Accordion, and Footer.
5. **Build Offering Detail & Checkout View:** Dynamic discount badge (`50% OFF`), units curriculum preview, and sticky enrollment bar.
6. **Build Phone OTP Modal:** Clean verification interface with cooldown timer.
7. **Write and Execute Test Suite:** Verify SEO structured data, metadata generation, and storefront calculations.

