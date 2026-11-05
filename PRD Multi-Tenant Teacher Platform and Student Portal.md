# PRD: Multi-Tenant Teacher Platform and Student Portal

**Version:** 2.0 | **Audience:** AI coding agent + engineering lead | **Source:** Original client flows (Humanities/CUET), generalized into a platform for any teacher

This PRD defines a **multi-tenant SaaS platform** where any teacher or institute can register, brand and customize their own student portal, sell batches/courses and deliver learning resources online. The Humanities/CUET site from the original client brief is **one example tenant** (Section 9), not the product. Nothing in the platform may be hard-coded to an exam, subject, language or domain.

---

## 0. Instructions for the coding agent

1. Audit the existing codebase first. Reuse existing auth, user, payment, notification, media and admin modules; list what is reused vs. new before coding.
2. **Everything is tenant-scoped.** Every business table carries `tenant_id`; every query, cache key, file path and job is filtered by it. Cross-tenant access is a critical defect.
3. **Nothing domain-specific is hard-coded.** Exams, subjects, labels, taglines, prices, features, WhatsApp templates, colours and section order are data or configuration.
4. Build in the phases in Section 13. Finish and test one phase before the next.
5. Requirements have IDs (e.g. FR-CAT-2); cite them in commits and PRs.
6. Items marked *Assumption* are defaults; if the repo contradicts one, flag it rather than silently deviating. Unknowns are in Section 15. Put unknown behaviour behind config or feature flags.

## 1. Product Overview

**Problem.** Independent teachers and small institutes sell through WhatsApp, YouTube and scattered tools. They lack a branded storefront, a secure place for paid content, payments, tests, student tracking and communication in one product.

**Solution.** A platform with two surfaces:

- **Tenant Studio (teacher side):** the teacher registers, creates a portal in minutes, customizes branding and pages, creates batches/courses, uploads content, sets prices, sends notifications and sees analytics.
- **Student Portal (student side, one per tenant):** a public, SEO-friendly branded site where students discover offerings, register with phone OTP, pay, and study (classes, notes, tests, practice, doubt support, community).

A third surface, the **Platform Admin**, lets us (the platform owner) manage tenants, plans, payouts and abuse.

## 2. Goals and Non-Goals

**Goals**

- G1: A teacher can launch a branded, working portal with a paid batch in under 30 minutes without a developer.
- G2: Complete student funnel per tenant: Discover, Register (OTP), Explore, Offering page, Pay, Study.
- G3: Strong tenant isolation, white-label branding, and per-tenant SEO.
- G4: Extensible through **modules** (doubt support, mentorship, advisory tools) that teachers switch on or off.
- G5: A sustainable SaaS model: plans, feature limits, optional transaction fee.

**Non-Goals (v1)**

- Public marketplace/aggregator of all teachers (later option, Phase 3).
- Native iOS/Android apps (responsive web/PWA only, unless the existing platform has apps).
- Fully custom code per tenant (customization is configuration, not code).

## 3. Roles

| Role | Scope | Can do |
| --- | --- | --- |
| Platform Super Admin | Platform | Approve/suspend tenants, manage plans, view all revenue, support impersonation (audited) |
| Teacher (Tenant Owner) | One tenant | Everything in the Studio, billing, payouts, staff management |
| Tenant Staff | One tenant | Scoped roles: Content Manager, Support/Mentor, Accountant |
| Student | One tenant | Register, buy, study, take tests, ask doubts |
| Visitor | One tenant | View public pages and free previews |
| Parent (optional, Phase 3) | One tenant | Read-only progress via a linked student |

## 4. Core Concepts (domain-neutral vocabulary)

Use these internal names in code and APIs. Tenants can **rename labels** in the UI (e.g. "Batch" to "Course", "Cohort" or "Program").

| Concept | Meaning | Example labels a tenant might use |
| --- | --- | --- |
| Tenant | One teacher/institute and its portal | Academy, Coaching, Classes |
| Category | A top-level grouping on the portal | Exam, Class, Skill, Subject area |
| Offering | A sellable (or free) unit students enroll in | Batch, Course, Cohort, Test Series, Crash Course |
| Unit | A subject/module inside an Offering | Subject, Module, Topic |
| Content Item | A single resource with a type | Live class, recorded class, notes, test, practice set, link |
| Enrollment | A student's access to an Offering | Purchase, admission |
| Entitlement | A rule that grants access to one Offering from another | "Free crash course with the foundation batch" |
| Module | An optional feature set a tenant enables | Doubt support, mentorship, WhatsApp community, advisory tools |

## 5. Architecture Principles

- **Multi-tenancy model:** shared application and database with `tenant_id` on every row (*Assumption*; use row-level security or a mandatory query scope). Tenant resolved from the hostname.
- **Addressing:** each tenant gets `<slug>.<platform-domain>`; paid plans can attach a **custom domain** with automatic TLS. The platform apex hosts marketing site, teacher signup and Super Admin.
- **Configuration over code:** theme tokens, section layout, labels, features, payment mode and enabled modules live in a tenant settings store with a published/draft state.
- **Entitlements and limits by plan:** storage, video minutes, students, staff seats, modules, custom domain, transaction fee are enforced server-side from a plan definition.
- **Isolation:** tenant-prefixed storage paths, signed URLs, tenant-scoped caches and queues, per-tenant rate limits, audit log on every admin action.
- **Extensibility:** modules register routes, admin screens, student screens and settings through a module interface so new modules do not touch core code.

## 6. Functional Requirements

### 6.1 Platform: Teacher Registration and Onboarding (FR-PLAT)

- FR-PLAT-1: Public teacher signup (phone OTP + email), then an onboarding wizard: institute name, slug/subdomain (availability check), logo, brand colour, one-line tagline, language(s), contact number, category.
- FR-PLAT-2: A new tenant starts in **Draft**; a portal is publicly visible only after the teacher presses **Publish**. Optional Super Admin approval (platform setting).
- FR-PLAT-3: Starter templates (e.g. "Exam coaching", "School tuition", "Skill course") pre-fill categories, sections and sample offerings; teacher can start blank.
- FR-PLAT-4: SaaS plans (Free/Trial, Pro, Business) with limits and an optional percentage fee on student payments; plan upgrade/downgrade with proration and invoices.
- FR-PLAT-5: Super Admin console: tenant list/search, suspend, plan override, usage, revenue, payouts, abuse reports, audited impersonation.
- FR-PLAT-6: Reserved slugs, profanity and trademark checks; one account may own multiple tenants (Phase 2).

### 6.2 Tenant Studio: Portal Customization (FR-STUDIO)

- FR-STUDIO-1: **Branding:** logo, favicon, colour palette, font choice (from a vetted list incl. Devanagari support), button style. Live preview; draft vs. published.
- FR-STUDIO-2: **Home page builder:** ordered, toggleable sections: Hero (logo, tagline, CTA), **Upcoming offerings slider**, Category cards ("Explorer"), Featured offerings, Why-us features, Results/testimonials, Teacher bio, FAQ, Contact. Drag-and-drop order; each section has editable text and images.
- FR-STUDIO-3: **Navigation and placement:** header layout with logo and Login/Register position (left or right), footer links, floating WhatsApp/Contact button.
- FR-STUDIO-4: **Terminology:** rename Batch/Subject/Study and other labels per tenant and per language.
- FR-STUDIO-5: **Pages:** About, Contact, Terms, Privacy, Refund policy (templates provided), plus custom static pages.
- FR-STUDIO-6: **Languages:** tenant chooses UI languages (EN/HI to start); content fields support per-language values.
- FR-STUDIO-7: **SEO per tenant:** title/description templates, OG image, sitemap, robots, structured data, keyword fields, Search Console verification tag.
- FR-STUDIO-8: **Domain:** subdomain management; custom-domain connect with DNS instructions, status check and auto TLS.
- FR-STUDIO-9: **Contact and WhatsApp:** support phone, WhatsApp number, message templates with variables (`{name}`, `{offering}`, `{unit}`, `{phone}`).
- FR-STUDIO-10: **Modules page:** switch modules on/off (limited by plan).

### 6.3 Catalog: Categories, Offerings, Units (FR-CAT)

- FR-CAT-1: **Categories** (tenant-defined): name, slug, icon/image, order, active, description. Empty category shows "Coming soon" with a **Notify me** capture.
- FR-CAT-2: **Offerings:** title, slug, category, type (batch/course/test series/free resource/bundle), description, start date, end date or "until exam/course end", language, banner, status (draft/upcoming/live/archived), visibility (public/unlisted/private), capacity (optional).
- FR-CAT-3: **Feature list:** teacher-defined icon+text items shown on the offering page.
- FR-CAT-4: **Pricing:** MRP, sale price, auto-computed discount badge and percent, offer-end date (optional countdown), free offerings allowed. Currency INR first; multi-currency later.
- FR-CAT-5: **Units:** teacher adds any number of units (subjects/modules) per offering; units can be reused across offerings.
- FR-CAT-6: **Schedule:** recurring/one-time live sessions, and recurring test slots (e.g. weekly full-length test).
- FR-CAT-7: **Entitlements and bundles:** an offering can auto-grant another (free or discounted); bundles sell several offerings together.
- FR-CAT-8: **Free preview policy:** teacher sets how many demo classes, sample tests and sample papers are open to logged-in non-buyers.
- FR-CAT-9: **Syllabus/Info documents:** attach downloadable PDFs per category/offering with a "Last updated" date.
- FR-CAT-10: **Announcements:** public notifications per category/offering shown on the public page.

### 6.4 Content Management (FR-CONT)

- FR-CONT-1: Content types (extensible): live class, recorded class, notes/document, test (see 6.5), practice set/question bank, previous-papers set, current-updates feed, external link, text lesson, custom type.
- FR-CONT-2: Attach content to Offering and optionally to Unit/Chapter; ordering, tags, publish/schedule date, free-preview flag.
- FR-CONT-3: Video: upload or link (YouTube unlisted/Vimeo/hosted); secure playback via signed/tokenized URLs; playback speed; resume position.
- FR-CONT-4: Documents: PDF/image/doc upload, in-browser viewer, optional download control, **dynamic watermark** (student phone/name).
- FR-CONT-5: Bulk import (CSV/Excel for questions and metadata; ZIP for notes).
- FR-CONT-6: Drip/lock rules: release by date, by order, or after completing a prerequisite (optional).
- FR-CONT-7: Storage and bandwidth metering against plan limits.

### 6.5 Assessments and CBT Engine (FR-ASSESS)

- FR-ASSESS-1: Test types: full-length, subject/chapter test, practice quiz, previous-paper test; sectioned tests allowed.
- FR-ASSESS-2: Question types: single/multiple choice, numeric, true/false, paragraph-based; images/LaTeX; **bilingual text** fields; marks, negative marks, explanations.
- FR-ASSESS-3: **CBT mode:** exam-like interface with timer, question palette, mark for review, section navigation, resume on refresh, auto-submit, tab-switch warnings (configurable).
- FR-ASSESS-4: Results: score, accuracy, time per question, section analysis, solutions; rank/leaderboard within offering (optional per test).
- FR-ASSESS-5: Scheduling: open/close windows, attempts allowed, recurring weekly slots.
- FR-ASSESS-6: Idempotent submission handling and load-safe (queue-backed) for spikes.

### 6.6 Live Classes (FR-LIVE)

- FR-LIVE-1: Provider-agnostic: join URL (Zoom/Meet/YouTube Live) first; native integration later.
- FR-LIVE-2: Class calendar for the student, reminders (in-app/WhatsApp/SMS), join button active before start time.
- FR-LIVE-3: Recording attached after class (manual link or auto-import), attendance tracking where the provider allows.

### 6.7 Student Portal (FR-STU)

The portal renders from tenant configuration. The journey is the same for every tenant:

1. **Discover:** public SEO pages per tenant.
2. **Land:** branded home with tagline and Login/Register as configured; upcoming-offerings slider; each slide **deep-links** to its offering page.
3. **Register/Login:** phone number to OTP; first verification creates a tenant-scoped student account; a **Welcome tag** with the student's name appears on top.
4. **Explore:** category cards ("More Explore" buttons) open category pages.
5. **Category page:** its offerings, announcements, free-preview items (within the caps), downloadable syllabus/info.
6. **Offering page:** dates, units, features, price block (MRP struck through, discount badge, final price), contact button, sticky Enroll CTA; enrolled students see **Go to Study**.
7. **Pay:** checkout, success, redirect to Home.
8. **Study entry:** after the first enrollment a **Study** entry (label configurable) appears in the header and Home.
9. **Study Hub:** enrolled offerings; inside one, the **unit list** and any enabled module tiles (e.g. advisory tool, doubts, mentorship, community).
10. **Unit page:** tiles for each content type the tenant has defined for that unit (Classes, Notes, Tests, Practice, Previous papers, CBT, Updates, etc.). Tiles are configuration; empty tiles hide.
11. **Community:** a join button opens WhatsApp with a pre-filled message (see 6.10).

Further requirements:

- FR-STU-1: **Authentication:** phone + OTP (6 digits, 5 min expiry, max 5 attempts, resend 30s, hourly send limit per number), optional email OTP; sessions per tenant; device limit (default 2) configurable by teacher within plan.
- FR-STU-2: **Profile:** name required; optional class/level, city, target goal, email; consent captured (DPDP).
- FR-STU-3: **Return-to-intent:** a logged-out user who clicked Enroll returns to the same checkout after OTP.
- FR-STU-4: **Progress tracking** per content item and per unit, a continue-learning card, study streak (Phase 2).
- FR-STU-5: **Student identity scope:** accounts are per tenant (*Assumption*); a platform-wide student identity/SSO is a later option.
- FR-STU-6: **Leads:** visitors who verify but do not buy are stored as tenant leads (exportable, WhatsApp/SMS opt-in respected).

### 6.8 Payments, Payouts and Billing (FR-PAY)

- FR-PAY-1: **Two layers:** (a) student pays tenant for offerings; (b) tenant pays the platform for the SaaS plan.
- FR-PAY-2: *Assumption for (a):* platform-level gateway with split settlement to the teacher (e.g. Razorpay Route/Cashfree split) and a configurable platform fee. Alternative: tenant brings its own gateway keys (feature-flagged). Decision needed (Section 15).
- FR-PAY-3: Server-side order creation; amounts never trusted from the client; **webhook plus signature verification** grants access; idempotent for duplicate webhooks.
- FR-PAY-4: Coupons (percent/flat, expiry, limits, per-offering), referral codes (Phase 3), manual/offline enrollment by teacher with audit log, refund marking.
- FR-PAY-5: Invoices/receipts per payment with the tenant's name and optional GST details; payout statements and reconciliation report for the teacher.
- FR-PAY-6: Failure/pending states with retry; abandoned-checkout reminders (Phase 2).
- FR-PAY-7: Taxes and refund policy shown at checkout from tenant policy pages.

### 6.9 Notifications (FR-NOTIF)

- FR-NOTIF-1: Channels: in-app feed, WhatsApp/SMS (opt-in), email, push if PWA.
- FR-NOTIF-2: Composer with text, link, image and **video**; targeting by whole tenant, category, offering, segment (e.g. enrolled vs. leads) or **individual student** (personal notification); scheduling; read tracking.
- FR-NOTIF-3: System notifications: OTP, payment receipt, class reminder, test reminder, new content, entitlement granted.
- FR-NOTIF-4: Per-tenant sending quotas and cost metering for SMS/WhatsApp.

### 6.10 Modules (optional, switchable per tenant) (FR-MOD)

Each module is independently enabled, plan-gated and configurable. v1 ships lightweight versions.

| Module | What it does |
| --- | --- |
| Doubt support | Students submit doubts (text/image) per unit; queue for staff; status and answers; scheduled doubt-clearing sessions |
| Mentorship | Mentor assignment, slot booking, session notes; optional post-programme mentorship window |
| Community (WhatsApp) | Join button builds `https://wa.me/<tenant number>?text=<URL-encoded message>`; default text: *"Hi sir, my name is {name}. I recently joined the {offering} batch. Please add me to the group."* Templates editable at offering and unit level; optional group invite links; click analytics; WhatsApp Business API automation later |
| Advisory tools | A generic form-to-result tool framework. Example tool: **Preference/College List Maker** (student enters scores + preferences, system ranks options from a tenant-uploaded dataset, shows an *estimates only* disclaimer, lets student reorder/save/export) |
| Guidance and counselling | Content pages plus booking for admission/career guidance |
| Continuing-education support | Gated content areas for later years of study (e.g. semester-wise support) |
| Free add-on offerings | Entitlement-driven free offerings (e.g. a bonus crash course) |

- FR-MOD-1: Module interface: registers settings schema, admin screens, student routes/tiles, permissions and analytics events; disabled modules return 404 and hide UI.
- FR-MOD-2: Advisory-tool datasets are tenant-owned uploads (CSV); the platform provides no scraped data and always shows the estimates disclaimer.

### 6.11 Analytics and Reporting (FR-ANA)

- FR-ANA-1: Tenant dashboard: visitors, registrations, conversion, revenue, active students, top content, test performance, doubt backlog, notification delivery.
- FR-ANA-2: Platform dashboard: tenants by plan, GMV, fees earned, churn, usage vs. limits.
- FR-ANA-3: Event tracking: `landing_view`, `slider_click`, `otp_requested`, `otp_verified`, `category_click`, `offering_view`, `enroll_click`, `checkout_started`, `payment_success`, `payment_failed`, `study_opened`, `content_opened`, `test_started`, `test_submitted`, `community_click`, `doubt_submitted`; all tagged with `tenant_id`.
- FR-ANA-4: CSV exports of students, enrollments, payments and leads.

### 6.12 SEO and Discoverability (FR-SEO)

- FR-SEO-1: Server-side rendered or pre-rendered public pages per tenant with unique title, description, canonical, Open Graph and structured data (`Organization`, `Course`, `FAQPage`).
- FR-SEO-2: Per-tenant `sitemap.xml` and `robots.txt`; clean slugs such as `/c/<category>` and `/o/<offering>`.
- FR-SEO-3: Core Web Vitals targets: LCP under 2.5s on mid-range mobile over 4G.
- FR-SEO-4: Note for teachers: code provides the technical SEO base; ranking also needs content, backlinks and Search Console setup.

## 7. Plans and Feature Flags (starting point)

| Capability | Free/Trial | Pro | Business |
| --- | --- | --- | --- |
| Students | Small cap | Higher cap | Very high/unlimited |
| Storage and video | Minimal | Standard | Large |
| Staff seats | 1 | 3 | 10+ |
| Custom domain | No | Yes | Yes |
| Modules | Core only | Most | All |
| White-label (remove platform badge) | No | Yes | Yes |
| Transaction fee | Highest | Lower | Lowest |
| Priority support | No | No | Yes |

Exact limits and prices are a business decision; implement them as editable plan records, not constants.

## 8. Suggested Enhancements Beyond the Original Brief

| Priority | Enhancement | Why |
| --- | --- | --- |
| Must | Anti-piracy: signed video URLs, watermarking, device limit | Protects teachers' paid content |
| Must | Lead capture and abandoned-checkout reminders | Recovers lost sales |
| Must | Per-tenant rate limits, audit logs, backups | Trust and safety on a shared platform |
| Must | Template library for fast launch | Meets the 30-minute launch goal |
| Should | Student dashboard: streaks, score trends, weak-area insights | Retention |
| Should | Referral and affiliate program | Organic growth |
| Should | AI helper for teachers: draft descriptions, FAQs, test questions | Saves setup time |
| Should | Parent reports via WhatsApp | Trust and renewals |
| Could | Public marketplace of tenants | Discovery for small teachers |
| Could | Native apps white-labelled per tenant | Higher engagement |
| Could | Certificates of completion | Credibility |

## 9. Reference Tenant: "Humanities CUET" (seed/demo data)

The original client request is loaded as the first demo tenant to prove the platform is configurable. It must be reproducible using Studio settings and seed data only.

| Item | Configuration |
| --- | --- |
| Tagline | "Humanities walon, tum kisi se kam nahi" under the logo; Login/Register on the left of the header |
| Categories | CUET, Class 12, Class 11, Class 10, Class 9, IPU, ITEP, Govt Exams, About Us (only CUET live; others "Coming soon") |
| Home slider | Upcoming batches; click opens the batch page |
| Offering 1 | CUET UG Foundation Batch 2027; starts 1 Jan 2027, until end of exam; bilingual |
| Offering 2 | CUET UG Crash Course 2027 (free for Foundation enrollees via Entitlement) |
| Units | English, Political Science, History, Geography, Legal Studies, Sociology, GAT (more soon) |
| Features | Live classes, recorded classes, chapter-wise notes, full-length mock every Sunday, bilingual teaching, PYQs 2022 to latest, doubt sessions, CBT practice, mentorship, admission guidance, private notification group |
| Pricing | MRP ₹8,000, sale ₹4,000, "50% OFF" |
| Free preview caps | 1 to 2 mocks, 1 to 2 demos, 1 previous-year paper, full latest syllabus |
| Unit tiles | Classes, Notes, Mock, PYQ, CBT Mock, Current Affairs ("CA", to confirm) |
| Modules on | Doubt support, Mentorship, Community (WhatsApp), Advisory tool (Preference List Maker, Phase 3), Guidance, Continuing-education support (1st to 3rd year, Phase 3) |
| Labels | "Study" for the Study entry; "Let's Study" for the unit list; "Batch" for Offering |

Acceptance for this section: the reference tenant can be recreated by another teacher in a different domain (e.g. a Class 10 maths tuition) by changing configuration only, with no code change.

## 10. Data Model (logical; adapt to existing schema)

Every table below includes `tenant_id` unless marked *platform*.

- **Tenant** *(platform)*: id, slug, name, status (draft/active/suspended), plan\_id, owner\_user\_id, custom\_domain, created\_at
- **Plan** *(platform)*: id, name, limits (json), price, fee\_percent, features (json)
- **Subscription** *(platform)*: tenant\_id, plan\_id, status, renews\_at
- **TenantSettings**: theme tokens, labels, languages, sections layout (draft/published), SEO, contact, WhatsApp config, enabled modules
- **StaffMember**: user\_id, role, permissions
- **User** (student/teacher): id, phone, email?, name, role; **TenantMembership**: user\_id, tenant\_id, role
- **OtpRequest**: phone, code\_hash, expires\_at, attempts, scope (tenant)
- **Category**: name, slug, icon, order, is\_active, description
- **Offering**: category\_id, type, title, slug, dates, language, status, visibility, mrp, sale\_price, offer\_ends\_at, banner, capacity
- **OfferingFeature**: offering\_id, icon, text, order
- **Unit**: name, slug, icon; **OfferingUnit**: offering\_id, unit\_id, order
- **ContentItem**: offering\_id, unit\_id?, type, title, chapter?, asset\_id/url, is\_free\_preview, publish\_at, order, drip\_rule?
- **LiveSession**: offering\_id, unit\_id?, starts\_at, join\_url, recording\_content\_id?
- **Test / Section / Question / Attempt**: duration, marks, negative marks, bilingual text, options, answer, explanation; attempt answers, score, timings
- **Enrollment**: user\_id, offering\_id, source (paid/entitlement/admin), status, granted\_at, expires\_at?
- **EntitlementRule**: source\_offering\_id, grants\_offering\_id, price\_override
- **Order / Payment / Refund**: gateway ids, amount, fee, split, status, webhook\_log
- **Coupon**: code, type, value, validity, limits, scope
- **Notification / Recipient**: audience, channels, media, schedule, read\_at
- **Doubt**, **MentorSlot/Booking**: module tables
- **Progress**: user\_id, content\_id, status, last\_position
- **Lead**: phone, source, interest, consent, created\_at
- **AdvisoryDataset / SavedResult**: module tables
- **Asset**: tenant-prefixed storage key, type, size, signed-url policy
- **UsageMeter**: storage, bandwidth, SMS, per period
- **AuditLog**: actor, action, entity, before/after

## 11. API and Route Outline

**Hostnames:** `platform.example` (marketing, signup, Super Admin), `studio.<platform>` or `/studio` (teacher), `<slug>.<platform>` or custom domain (student portal).

**Student routes:** `/`, `/c/:category`, `/o/:offering`, `/study`, `/study/:offering`, `/study/:offering/u/:unit`, `/study/:offering/tools/:tool`, `/notifications`, `/profile`.

**API (REST; tenant derived from host, never from the request body):**

- Platform: `POST /platform/signup`, `POST /platform/tenants`, `GET /platform/slug-available`, plan and subscription endpoints, Super Admin CRUD.
- Auth: `POST /auth/otp/request`, `POST /auth/otp/verify`, `POST /auth/logout`, `GET/PATCH /me`.
- Public: `GET /site-config`, `GET /categories`, `GET /offerings?upcoming=true`, `GET /offerings/:slug`.
- Commerce: `POST /checkout/order`, `POST /webhooks/payment`, `POST /coupons/validate`, `GET /me/enrollments`.
- Learning: `GET /offerings/:id/units`, `GET /units/:id/content?type=`, `POST /tests/:id/start`, `POST /tests/:id/submit`, `GET /attempts/:id`, `POST /progress`.
- Engagement: `GET /notifications`, `POST /notifications/:id/read`, `GET /community/link`, `POST /leads`, `POST /track`.
- Studio (staff): CRUD for settings, sections, categories, offerings, units, content, tests/questions (bulk import), coupons, notifications, staff, modules, domain, analytics, exports.

## 12. Non-Functional Requirements

- **Isolation and security:** mandatory tenant scoping in the data layer (tested), OWASP basics, hashed OTPs, rate limiting and bot protection on OTP, signed media URLs, secrets in env vars, payment signature verification, PII encryption at rest where supported, audited admin and impersonation actions.
- **Performance:** pages interactive under 3s on mid-range Android over 4G; CDN for static and media; image optimization; tenant config cached per host with safe invalidation.
- **Scalability:** launch-time spikes per tenant must not degrade others (per-tenant throttles, queue-backed submissions and webhooks, noisy-neighbour limits).
- **Compliance:** India DPDP consent, privacy policy, terms and refund policy templates; opt-in for WhatsApp/SMS marketing; data export and deletion on request; tenant offboarding with data export.
- **Accessibility and localization:** WCAG 2.1 AA basics, mobile-first, i18n resource files (EN/HI first), Devanagari fonts.
- **Observability:** error tracking, structured logs with `tenant_id`, usage metering, uptime alerts, backups and tested restores.
- **Browser support:** latest two versions of Chrome, Safari, Edge, Firefox; Android Chrome and iOS Safari.

## 13. Release Plan

**Phase 1: Platform core and a sellable portal (MVP)** Tenant model and isolation, teacher signup and wizard, Studio branding and home-page builder (core sections), categories/offerings/units/features/pricing, student OTP auth, public pages with SEO, checkout with split payments, enrollment, Study entry and Study Hub shell, basic content (notes, recorded video, live link), Super Admin basics, analytics events, the reference tenant seed.

**Phase 2: Learning experience and growth tools** Tests and CBT engine, live-class calendar and reminders, progress tracking, notifications with video and targeting, coupons, entitlements and bundles, Doubt support and Community modules, subscriptions/plan enforcement, custom domains, bilingual UI toggle, abandoned-checkout reminders, student dashboard.

**Phase 3: Depth and scale** Advisory tools framework (Preference List Maker as first tool), Mentorship, Guidance and Continuing-education modules, referral/affiliate, WhatsApp Business API automation, parent view, multiple tenants per account, marketplace option, white-label apps.

## 14. Acceptance Criteria (key flows)

1. **Teacher onboarding:** A new teacher completes signup and the wizard, then publishes a portal reachable at `<slug>.<platform>` within 30 minutes; unpublished portals return a "not available" page to the public.
2. **Isolation:** Tenant A's staff or students cannot read, list or modify any Tenant B record by any API or URL; automated tests cover every endpoint with cross-tenant IDs.
3. **Customization:** Changing logo, colours, tagline, section order, Login/Register position and labels in Studio updates the published portal after Publish without a deploy.
4. **Student auth:** Valid phone gets an OTP; correct OTP logs in and shows a Welcome tag; 5 wrong tries lock the number for 15 minutes; account is created only inside the current tenant.
5. **Explorer and category:** Category cards render from data; "More Explore" opens the category; empty categories show "Coming soon" with a Notify me capture.
6. **Offering page:** With MRP 8000 and sale 4000 the page shows the struck MRP, "50% OFF" and the final price; changing either value updates the badge automatically.
7. **Payment:** A verified payment creates exactly one enrollment even if the webhook arrives twice; tampering with the amount has no effect; the split/fee is recorded; the student returns to Home with the Study entry visible.
8. **Entitlement:** Enrolling in Offering A auto-adds Offering B at 0 when a rule exists and the student is notified.
9. **Study Hub:** Only enrolled students open `/study/:offering`; others are redirected to the offering page.
10. **Unit page:** Only content types that have items appear as tiles; a CBT test enforces its timer and auto-submits.
11. **Free preview caps:** Non-buyers never see more previews than the teacher's configured caps.
12. **Community:** The join button opens WhatsApp with the exact pre-filled text, including the student's name and offering.
13. **Modules:** Disabling a module hides its UI and returns 404 for its routes; plan limits block enabling modules above the plan.
14. **Plan limits:** Exceeding storage, student or staff limits blocks the action with a clear upgrade message.
15. **Reference tenant:** The Humanities CUET tenant in Section 9 is recreated with configuration only; a second sample tenant for a different subject is also created with no code changes.
16. **SEO:** Lighthouse SEO score of 90 or more on a tenant home and an offering page; per-tenant sitemap and structured data validate.

## 15. Open Questions and Assumptions

| # | Question | Default assumption |
| --- | --- | --- |
| 1 | What is the existing platform/stack, and which modules (auth, payments, media) already exist? | Agent audits the repo and reuses what exists |
| 2 | Platform name, domain and branding? | Placeholder name; configurable |
| 3 | Student-payment model: platform gateway with split settlement, or each teacher's own gateway keys? | Platform gateway with split settlement and a configurable fee |
| 4 | SaaS pricing, plan limits and transaction fee? | Editable plan records with placeholder values |
| 5 | Do students keep one identity across tenants? | No, per-tenant accounts in v1 |
| 6 | Teacher approval: instant publish or Super Admin review? | Instant for Trial, optional review flag |
| 7 | Live-class provider and video hosting/DRM provider? | Join-URL field and signed-URL streaming, provider-agnostic |
| 8 | Is "CA" on the unit page Current Affairs? | Yes, as a content type |
| 9 | Source of cutoff or college data for advisory tools? | Tenant uploads CSV; no scraping |
| 10 | Access duration after an offering ends? | Until end plus 30 days, configurable |
| 11 | WhatsApp: manual add via pre-filled message, or Business API automation? | Pre-filled message in v1, API in Phase 3 |
| 12 | Languages beyond English and Hindi? | EN and HI first; i18n-ready |
| 13 | Legal/tax: GST invoicing for platform fee and for teachers? | Configurable GST fields |

## 16. Definition of Done

- Phase-scoped requirements implemented and mapped to IDs in the PRs.
- Tests: unit tests for tenant scoping, pricing, OTP, enrollment, entitlement and CBT scoring; integration tests for payment webhook idempotency and split recording; automated cross-tenant access tests; end-to-end test of the full student journey on two different tenants.
- A teacher can operate every visible text, price, image, link, label and module from Studio without code changes.
- Documentation: README with environment variables, domain/TLS setup, webhook setup, seed scripts (platform plans, the reference tenant and a second sample tenant), and deployment/rollback notes.
