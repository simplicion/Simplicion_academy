# Simplicion Academy Agent Memory & Architectural Blueprint

## Context & Vision
**Simplicion Private Limited** is building **Simplicion Academy**, a comprehensive "Career and Business Operating System". The platform uses **Docusaurus** as its primary content engine for internal operating procedures (SACOS), foundation standards (SAFS), and structured markdown-first educational content.

---

## 1. Academy Constitution (SAFS-00)

**SAFS-00** serves as the **Academy Constitution**. It is the single canonical source of truth for:
- Official terminology & dictionary
- Canonical educational taxonomy & object hierarchy
- Universal Object Identification Standard (UOIS)
- Normative language and rules

All future standards (SAFS-01 through SAFS-06 and SACOS Volumes 0 - 13) MUST reference SAFS-00 rather than redefining terms.

---

## 2. Documentation Standard Folder Architecture

Each Standard and Volume directory adopts this clean modular sub-folder layout:

```text
safs-00/ (or volume-XX/)
│
├── index.md                      (Standard Overview & Root Document)
├── _category_.json               (Category config)
│
├── chapters/                     (All narrative chapter markdown files)
│   ├── _category_.json
│   ├── chapter-01-introduction.md
│   ├── chapter-02-purpose.md
│   ├── chapter-03-guiding-principles.md
│   ├── chapter-04-taxonomy-framework.md
│   ├── chapter-05-learning-hierarchy.md
│   ├── chapter-06-content-definitions.md
│   └── ...
│
├── diagrams/                     (Mermaid .mmd files)
│   ├── learning-hierarchy.mmd
│   └── architecture.mmd
│
├── assets/                       (Visual media)
│   ├── images/
│   ├── icons/
│   └── illustrations/
│
└── references/                   (Supporting standards & bibliography)
    ├── bibliography.md
    ├── glossary-links.md
    └── related-standards.md
```

---

## 3. Standardized Chapter Structure (Chapter 4 Onward)

Every chapter MUST follow this 10-part standardized architecture pattern:

1. **Purpose**
2. **Normative Requirements** (`MUST` / `SHOULD` / `MAY`)
3. **Concept Diagram** (`mermaid`)
4. **Definitions**
5. **Rules**
6. **Examples**
7. **Common Mistakes**
8. **Implementation Notes**
9. **Related Standards**
10. **Revision Notes**

---

## 4. Universal Object Identification Standard (UOIS)

Format: `DOMAIN-TYPE-NAMESPACE-SEQUENCE` (e.g. `ACD-MOD-AIUIUX-000001`)

- **FS-001 (Immutable Identity)**: Every educational object MUST have a globally unique identifier that never changes, is never reused, and survives renaming or relocation.
- **FS-002 (Human-Readable IDs)**: Identifiers SHOULD be human and machine readable (`DOMAIN-TYPE-NAMESPACE-SEQUENCE`).
- **FS-003 (Stable References)**: All documentation, APIs, databases, AI tutor models, analytics, and certificates MUST reference object IDs rather than display names.
- **FS-004 (Display Name Independence)**: Renaming an object title MUST NOT require updating database IDs or internal API references.

---

## 5. Foundation Standards (SAFS)

- **SAFS-00**: Academy Lexicon & Taxonomy (Academy Constitution)
- **SAFS-01**: Academy Architecture
- **SAFS-02**: Data Standards & UOIS
- **SAFS-03**: Component Standards
- **SAFS-04**: Design Standards
- **SAFS-05**: Content Standards
- **SAFS-06**: Governance & Lifecycle Standards (Lifecycle, Versioning, Deprecation, Audits)

---

## 6. Operating System Volumes (SACOS)

- **Volume 0**: Governance & Master Index
- **Volume 1**: Academy Standards
- **Volume 2**: Curriculum Design
- **Volume 3**: Content Production
- **Volume 4**: Video Production
- **Volume 5**: Visual Assets
- **Volume 6**: Assessment
- **Volume 7**: Projects
- **Volume 8**: Certification
- **Volume 9**: Platform
- **Volume 10**: Quality
- **Volume 11**: AI
- **Volume 12**: Templates
- **Volume 13**: Gold Standard Examples

---

## 7. Implementation Status

- [x] Initialized Docusaurus TypeScript workspace (`docs-platform`).
- [x] Cleaned default Docusaurus docs and blog items.
- [x] Configured modular sub-folder standard (`chapters/`, `diagrams/`, `assets/`, `references/`) for `safs-00`.
- [x] Saved SAFS-00 `index.md` & Chapters 1 - 20 (Full Constitution complete!).
- [x] Declared SAFS-00 as the official **Academy Constitution**.
- [x] Approved UOIS (`FS-001` - `FS-004`) and `SAFS-06 Governance & Lifecycle Standards`.
- [x] Completed platform re-branding to Simplicion Academy with custom landing page and brand palette.
- [x] Saved SAFS-01 `index.md` & Chapters 1 - 20 (Full SAFS-01 Academy Architecture complete!).
- [x] Saved SAFS-02 `index.md` & Chapters 1 - 8 (Full SAFS-02 Data Standards complete!).
- [x] Saved SAFS-03 `index.md` & Chapters 1 - 8 (Full SAFS-03 Component Standards complete!).
- [x] Saved SAFS-04 `index.md` & Chapters 1 - 8 (Full SAFS-04 Design Standards complete!).
- [x] Saved SAFS-05 `index.md` & Chapters 1 - 8 (Full SAFS-05 Content Standards complete!).
- [x] Saved SAFS-06 `index.md` & Chapters 1 - 8 (Full SAFS-06 Governance & Lifecycle Standards complete!).
- [x] **ENTIRE SIMPLICION ACADEMY FOUNDATION STANDARDS (SAFS-00 TO SAFS-06) 100% COMPLETE AND PUBLISHED!**
- [x] **SAIS-04 — Learning Experience (LX) Standards index.md & Chapters 1 - 8 (100% COMPLETE AND PUBLISHED!)**









