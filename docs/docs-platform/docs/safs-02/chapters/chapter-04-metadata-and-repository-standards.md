---
title: Chapter 4 — Metadata & Repository Standards
description: Defines the canonical metadata model, repository organization, discovery mechanisms, indexing standards, and governance requirements for all Academy assets.
sidebar_position: 4
slug: /safs/02/chapter-04-metadata-and-repository-standards
tags:
  - metadata
  - repository
  - search
version: 1.0.0
status: Approved
owner: Simplicion Academy
classification: Internal
review_cycle: Every 6 Months
---

# Chapter 4 — Metadata & Repository Standards

> **Normative**
>
> Every object stored, managed, indexed, searched, versioned, or published within Simplicion Academy SHALL comply with the metadata and repository standards defined in this chapter.

---

# 4.1 Purpose

Metadata provides meaning, context, discoverability, and governance.

Without metadata:

- AI cannot understand content.
- Search becomes unreliable.
- Relationships become ambiguous.
- Governance becomes difficult.
- Analytics lose accuracy.

Metadata SHALL therefore be treated as a first-class component of every Academy object.

---

# 4.2 Objectives

This chapter establishes standards for:

- metadata architecture
- metadata schemas
- repository organization
- search optimization
- AI indexing
- tagging
- classification
- discovery
- governance
- version control

---

# 4.3 Metadata Principles

Every metadata model SHALL follow these principles.

## Principle 1 — Completeness

Every managed object SHALL include all required metadata before publication.

---

## Principle 2 — Consistency

Equivalent objects SHALL expose identical metadata fields.

Example

```text
Learning Unit
      │
      ▼
title
description
keywords
version
status
```

---

## Principle 3 — Machine Readability

Metadata SHALL be structured for both humans and machines.

Preferred formats include:

- YAML
- JSON
- Structured Markdown Frontmatter

---

## Principle 4 — Reusability

Metadata SHALL be reusable across:

- repositories
- APIs
- AI systems
- analytics
- search
- documentation

---

## Principle 5 — Extensibility

Optional metadata MAY be added without affecting compatibility.

---

# 4.4 Metadata Categories

Metadata SHALL be organized into the following categories.

| Category | Purpose |
|-----------|---------|
| Identity | Unique identification |
| Descriptive | Human understanding |
| Structural | Organization |
| Relationship | Connections |
| Lifecycle | State management |
| Governance | Ownership |
| AI | Machine understanding |
| Search | Discovery |
| Analytics | Measurement |
| Security | Classification |

---

# 4.5 Identity Metadata

Every entity SHALL include identity metadata.

Required fields

| Field | Required |
|---------|----------|
| id | Yes |
| slug | Yes |
| title | Yes |
| shortTitle | Optional |
| version | Yes |

Example

```yaml
id: LU-000021
slug: introduction-to-rest
title: Introduction to REST APIs
version: 1.0.0
```

Identity metadata SHALL remain stable throughout the object's lifecycle.

---

# 4.6 Descriptive Metadata

Descriptive metadata explains the object.

Required fields

- title
- description
- summary
- keywords
- language

Optional fields

- subtitle
- abstract
- notes
- audience
- estimatedDuration

Example

```yaml
description: Learn the fundamentals of REST APIs.

keywords:
  - api
  - http
  - rest
```

---

# 4.7 Structural Metadata

Structural metadata defines where an object belongs.

Example

```text
Learning Path
      │
      ▼
Track
      │
      ▼
Module
      │
      ▼
Section
      │
      ▼
Topic
      │
      ▼
Learning Unit
```

Required attributes

- parentId
- sequence
- hierarchyLevel

---

# 4.8 Relationship Metadata

Relationship metadata SHALL explicitly define object connections.

Supported relationships

- parent
- child
- prerequisite
- successor
- dependency
- reference
- related

Example

```yaml
relationships:
  parent: TOP-000021
  prerequisites:
    - LU-000014
  related:
    - LU-000034
```

---

# 4.9 Lifecycle Metadata

Every object SHALL expose lifecycle information.

Required fields

```text
status:
Draft
Review
Approved
Published
Deprecated
Archived
```

Additional metadata

- createdAt
- updatedAt
- approvedAt
- publishedAt
- retiredAt

---

# 4.10 Governance Metadata

Governance metadata defines ownership.

Required fields

- owner
- steward
- reviewer
- approver

Example

```yaml
owner: Curriculum Team
reviewer: Technical Reviewer
approver: Academy Board
```

---

# 4.11 AI Metadata

AI systems require richer metadata.

Every AI-searchable object SHOULD include:

- learning outcomes
- competencies
- prerequisites
- difficulty
- audience
- learning objectives
- embeddings
- semantic tags

Example

```yaml
difficulty: Beginner
competencies:
  - CMP-00012
semanticTags:
  - networking
  - api
  - backend
```

---

# 4.12 Search Metadata

Search services SHALL use standardized metadata.

Required fields

- title
- keywords
- tags
- category
- language

Optional

- synonyms
- aliases
- searchBoost

Search SHALL NOT rely solely on free-text indexing.

---

# 4.13 Analytics Metadata

Analytics metadata enables reporting.

Examples

- completionRate
- averageScore
- estimatedDuration
- difficulty
- popularity
- usageCount

Analytics metadata SHALL NOT replace operational metadata.

---

# 4.14 Security Metadata

Every object SHALL declare its classification.

Supported values

```text
Public
Internal
Restricted
Confidential
```

Optional

- retentionPeriod
- encryptionRequired
- exportAllowed

---

# 4.15 Repository Architecture

The Academy repository SHALL be organized logically.

Example

```text
academy/
├── learning-paths/
├── modules/
├── topics/
├── learning-units/
├── assessments/
├── competencies/
├── careers/
├── ai/
├── analytics/
├── governance/
└── assets/
```

Objects SHALL NOT be stored in arbitrary locations.

---

# 4.16 File Naming Standards

Names SHALL be:

- lowercase
- descriptive
- hyphen-separated

Correct

```text
introduction-to-rest.md
```

Incorrect

```text
REST_NEW_FINAL2.md
Doc1.md
file-final-final.md
```

---

# 4.17 Repository Versioning

Repositories SHALL preserve complete history.

Version identifiers SHALL follow Semantic Versioning.

```text
1.0.0
1.1.0
2.0.0
```

Major changes SHALL preserve migration guidance.

---

# 4.18 Discovery Standards

Every published object SHALL be discoverable through:

- navigation
- search
- relationships
- AI assistants
- repository indexes

Discovery SHALL NOT depend on physical storage location.

---

# 4.19 Metadata Validation

Before publication every object SHALL pass validation.

Checklist

✓ Identifier present

✓ Title present

✓ Description present

✓ Owner assigned

✓ Status assigned

✓ Version assigned

✓ Relationships valid

✓ Tags complete

✓ AI metadata present

✓ Repository location valid

---

# 4.20 Repository Governance

Repository governance SHALL include:

- ownership
- access control
- review process
- version control
- audit logging
- archival
- restoration
- backup

Repository administrators SHALL maintain repository integrity.

---

# 4.21 Normative Requirements

The following requirements are mandatory.

1. Every managed object SHALL contain metadata.
2. Metadata SHALL follow the canonical schema.
3. Every object SHALL expose identity metadata.
4. Repository organization SHALL follow Academy standards.
5. File names SHALL follow naming conventions.
6. Metadata SHALL support AI consumption.
7. Search metadata SHALL be maintained.
8. Lifecycle metadata SHALL remain accurate.
9. Governance metadata SHALL identify ownership.
10. Repository changes SHALL be version controlled.

---

# 4.22 Summary

This chapter establishes the metadata foundation for Simplicion Academy.

It defines:

- metadata architecture
- metadata categories
- repository organization
- search optimization
- AI metadata
- governance metadata
- validation rules
- versioning
- repository standards

These standards ensure that every Academy object remains discoverable, interoperable, AI-ready, and governed throughout its lifecycle.

The next chapter, **Chapter 5 — Data Lifecycle**, defines how data is created, reviewed, approved, published, maintained, revised, archived, and retired across the Academy.
