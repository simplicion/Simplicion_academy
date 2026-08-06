---
title: Chapter 4 — Taxonomy Framework
description: Defines the official educational taxonomy and hierarchical relationships used throughout Simplicion Academy.
sidebar_position: 4
slug: /safs/00/taxonomy-framework
tags:
  - taxonomy
  - hierarchy
  - learning
  - foundation
version: 1.0.0
status: Approved
owner: Simplicion Academy
classification: Internal
review_cycle: Every 6 Months
---

# Chapter 4 — Taxonomy Framework

> **A taxonomy provides the common language for an ecosystem. Every educational object within Simplicion Academy MUST belong to this taxonomy.**

---

# 4.1 Purpose

The Taxonomy Framework defines the official hierarchy of educational objects used throughout Simplicion Academy.

It ensures that:

- Every learning object has a single place within the hierarchy.
- Every educational asset has a defined relationship with other assets.
- Curriculum, software, AI systems, analytics, and documentation all use the same structural model.

No object may exist outside this taxonomy unless introduced through an approved revision of the Foundation Standards.

---

# 4.2 Design Principles

The taxonomy follows these principles:

- Hierarchical
- Modular
- Reusable
- Extensible
- Platform Independent
- AI Compatible
- Version Controlled

---

# 4.3 Academy Taxonomy

```text
Academy
â”‚
â”œâ”€â”€ Learning Path
â”‚     â”‚
â”‚     â””â”€â”€ Track
â”‚            â”‚
â”‚            â””â”€â”€ Module
â”‚                    â”‚
â”‚                    â””â”€â”€ Section
â”‚                           â”‚
â”‚                           â””â”€â”€ Topic
â”‚                                   â”‚
â”‚                                   â””â”€â”€ Learning Unit
â”‚                                           â”‚
â”‚                                           â”œâ”€â”€ Learning Blocks
â”‚                                           â”œâ”€â”€ Activities
â”‚                                           â”œâ”€â”€ Assessments
â”‚                                           â”œâ”€â”€ Resources
â”‚                                           â””â”€â”€ Assets
```

---

# 4.4 Taxonomy Levels

| Level | Educational Object | Purpose |
|--------|--------------------|---------|
| 1 | Academy | Complete learning ecosystem |
| 2 | Learning Path | Collection of related Tracks |
| 3 | Track | End-to-end learning outcome |
| 4 | Module | Reusable skill package |
| 5 | Section | Logical grouping within a Module |
| 6 | Topic | Individual subject area |
| 7 | Learning Unit | Smallest teachable instructional unit |
| 8 | Learning Block | Atomic content component |

---

# 4.5 Object Relationships

Each educational object has one parent.

Each object may contain multiple child objects.

```text
Academy
    â”œâ”€â”€ many Learning Paths

Learning Path
    â”œâ”€â”€ many Tracks

Track
    â”œâ”€â”€ many Modules

Module
    â”œâ”€â”€ many Sections

Section
    â”œâ”€â”€ many Topics

Topic
    â”œâ”€â”€ many Learning Units

Learning Unit
    â”œâ”€â”€ many Learning Blocks
```

This structure creates a predictable and scalable hierarchy.

---

# 4.6 Learning Blocks

Learning Blocks are the smallest reusable instructional components.

Examples include:

- Explanation
- Example
- Illustration
- Diagram
- Image
- Video
- Practice Exercise
- Reflection
- Quiz Question
- AI Prompt
- Code Sample
- Download
- Template
- Case Study
- Reference

Learning Blocks may be reused across multiple Learning Units where appropriate.

---

# 4.7 Reusability Rules

To maximize consistency:

- Modules MAY be reused across multiple Tracks.
- Sections SHOULD remain within their parent Module.
- Topics SHOULD NOT be duplicated if reuse is possible.
- Learning Units SHOULD be reusable whenever practical.
- Learning Blocks SHOULD be designed for maximum reuse.

Duplication should be avoided unless justified by learning outcomes.

---

# 4.8 Taxonomy Constraints

The following constraints apply:

| Rule | Requirement |
|------|-------------|
| One Parent | Every object MUST belong to exactly one parent object. |
| Unique Identifier | Every object MUST have a globally unique identifier. |
| Defined Purpose | Every object MUST have a documented purpose. |
| Metadata | Every object MUST include required metadata. |
| Version | Every object MUST be versioned. |

---

# 4.9 Benefits

Adopting this taxonomy enables:

- Consistent curriculum design.
- Reusable educational assets.
- Predictable platform behavior.
- Reliable analytics.
- AI-friendly content relationships.
- Simplified maintenance.
- Easier onboarding for contributors.

---

# 4.10 Implementation Guidelines

Platform implementations SHOULD reflect the taxonomy directly.

Examples:

- Database schemas SHOULD model parent-child relationships.
- Navigation SHOULD follow the educational hierarchy.
- APIs SHOULD expose hierarchical structures.
- AI systems SHOULD reference canonical object identifiers.
- Analytics SHOULD aggregate data at each taxonomy level.

---

# 4.11 Common Mistakes

Avoid the following:

- Treating a Module as a Track.
- Creating duplicate Topics.
- Mixing Learning Units across unrelated Topics.
- Embedding unrelated concepts within a single Learning Unit.
- Creating educational objects without metadata.
- Breaking parent-child relationships.

---

# 4.12 Related Standards

- SAFS-01 — Academy Architecture
- SAFS-02 — Data Standards
- SAFS-03 — Component Standards
- SAFS-05 — Content Standards
- SACOS Volume 1 — Curriculum Design

---

# Summary

The Taxonomy Framework defines the official educational hierarchy for Simplicion Academy. It establishes consistent relationships between educational objects, promotes reuse, and provides the structural foundation for curriculum design, platform implementation, AI systems, and analytics.

Every educational object introduced into the academy MUST conform to this taxonomy.

---

## Next Chapter

âž¡ï¸ **Chapter 5 — Learning Hierarchy**
