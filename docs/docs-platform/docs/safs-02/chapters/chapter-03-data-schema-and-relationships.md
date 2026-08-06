---
title: Chapter 3 — Data Schema & Relationships
description: Defines canonical schemas, attributes, identifiers, relationships, validation rules, and serialization standards for all Academy data.
sidebar_position: 3
slug: /safs/02/chapter-03-data-schema-and-relationships
tags:
  - data
  - schema
  - relationships
version: 1.0.0
status: Approved
owner: Simplicion Academy
classification: Internal
review_cycle: Every 6 Months
---

# Chapter 3 — Data Schema & Relationships

> **Normative**
>
> Every data object SHALL conform to the schema and relationship standards defined in this chapter. These standards ensure that all Academy services interpret, validate, exchange, and govern information consistently.

---

# 3.1 Purpose

While Chapter 2 defines **what** the Academy entities are, this chapter defines **how** those entities are represented.

This chapter establishes:

- canonical schemas
- attribute definitions
- identifier rules
- naming standards
- relationship standards
- cardinality
- validation rules
- serialization standards
- interoperability requirements

These standards SHALL be used by:

- APIs
- Databases
- AI systems
- Search engines
- Repository services
- Analytics
- Integrations

---

# 3.2 Canonical Schema Principles

Every schema SHALL follow these principles.

## Principle 1 — Consistency

Equivalent objects SHALL use identical attribute names.

Example

Correct

```text
title
description
createdAt
updatedAt
version
status
```

Incorrect

```text
name
heading
modified
lastChanged
```

---

## Principle 2 — Predictability

Developers SHALL be able to predict attribute names across every entity.

Example

Every entity SHALL contain

- id
- title
- version
- status
- createdAt
- updatedAt

unless explicitly exempted.

---

## Principle 3 — Extensibility

Schemas SHALL support future extensions without breaking compatibility.

New optional attributes MAY be added.

Existing required attributes SHALL NOT be removed without governance approval.

---

## Principle 4 — Technology Independence

Schemas SHALL remain independent of:

- SQL
- NoSQL
- Graph databases
- Programming languages
- Frameworks
- Cloud vendors

---

# 3.3 Canonical Entity Schema

Every Academy entity SHALL implement the following minimum schema.

| Attribute | Type | Required |
|------------|------|----------|
| id | String | Yes |
| title | String | Yes |
| description | String | Yes |
| version | String | Yes |
| status | Enum | Yes |
| owner | String | Yes |
| createdAt | DateTime | Yes |
| updatedAt | DateTime | Yes |
| lifecycleState | Enum | Yes |
| metadata | Object | Yes |

Additional attributes MAY be defined by domain-specific entities.

---

# 3.4 Identifier Standards

Every identifier SHALL be globally unique.

## Format

```text
PREFIX-000001
```

Examples

```text
LP-000001

MOD-000132

LU-000541

ASM-000084

CMP-000019

USR-001245
```

Identifiers SHALL:

- never change
- never be reused
- remain unique forever
- remain human-readable

---

## Reserved Prefixes

| Prefix | Entity |
|---------|--------|
| LP | Learning Path |
| TRK | Track |
| MOD | Module |
| SEC | Section |
| TOP | Topic |
| LU | Learning Unit |
| LB | Learning Block |
| ACT | Activity |
| ASM | Assessment |
| CMP | Competency |
| SKL | Skill |
| CRT | Certification |
| BDG | Badge |
| USR | User |
| LRN | Learner |
| INS | Instructor |
| ORG | Organization |
| RES | Resource |
| AST | Asset |
| DOC | Document |
| AIA | AI Agent |
| KB | Knowledge Base |
| EVT | Analytics Event |
| RPT | Report |

---

# 3.5 Attribute Naming Standards

Attribute names SHALL use lower camelCase.

Correct

```text
learningOutcomeIds

estimatedDuration

createdAt

updatedAt
```

Incorrect

```text
learning_outcomes

Created_Date

LearningOutcome

duration_minutes
```

Names SHALL:

- be descriptive
- avoid abbreviations
- remain singular unless representing collections

---

# 3.6 Required Attribute Groups

Every entity SHALL organize attributes into logical groups.

## Identity

- id
- title
- slug

---

## Description

- description
- summary

---

## Governance

- owner
- version
- status

---

## Lifecycle

- createdAt
- updatedAt
- lifecycleState

---

## Metadata

- tags
- keywords
- language
- classification

---

## Relationships

- parentId
- childIds
- prerequisiteIds
- relatedIds

---

# 3.7 Relationship Standards

Relationships SHALL be explicitly declared.

Supported relationship types include:

```text
Parent Of

Child Of

Contains

Contained By

Prerequisite

Successor

Depends On

References

Maps To

Uses

Implements

Related To
```

Implicit relationships SHALL NOT be assumed.

---

# 3.8 Cardinality Rules

The Academy recognizes the following relationship cardinalities.

## One-to-One

```text
Certificate
      │
      ▼
Credential
```

---

## One-to-Many

```text
Module
      │
      ▼
Sections
```

---

## Many-to-One

```text
Learning Units
      │
      ▼
Topic
```

---

## Many-to-Many

```text
Competencies
      │
      ▲
      ▼
Learning Units
```

Every relationship SHALL specify its cardinality.

---

# 3.9 Parent–Child Constraints

A child SHALL have one canonical parent unless explicitly defined otherwise.

Example

```text
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

Cycles SHALL NOT exist.

Example of an invalid structure:

```text
Module
  │
  ▼
Topic
  │
  ▼
Module
```

---

# 3.10 Referential Integrity

Referenced entities SHALL exist before references are created.

Invalid

```text
Learning Unit
      │
      references
      │
      ▼
CMP-900001 (not found)
```

Valid

```text
Learning Unit
      │
      references
      │
      ▼
CMP-000017
```

Deleting an entity SHALL NOT leave orphaned references.

---

# 3.11 Enumeration Standards

Enumerations SHALL be centrally defined.

Example

Status

```text
Draft

Review

Approved

Published

Deprecated

Archived
```

Difficulty

```text
Beginner

Intermediate

Advanced

Expert
```

Lifecycle State

```text
Planning

Development

Review

Approval

Publication

Maintenance

Retired
```

Applications SHALL use these canonical values.

---

# 3.12 Validation Rules

Every entity SHALL pass validation before publication.

Validation categories include:

## Structural Validation

- required attributes
- valid schema
- valid identifier

---

## Relationship Validation

- parent exists
- references valid
- no cycles

---

## Metadata Validation

- required metadata present
- valid keywords
- valid language

---

## Governance Validation

- owner assigned
- lifecycle state valid
- version present

---

## AI Validation

- AI metadata complete
- embeddings synchronized
- searchable

---

# 3.13 Serialization Standards

Canonical data SHALL support standardized serialization.

Approved formats include:

- JSON
- YAML
- Markdown frontmatter
- CSV (where appropriate)

Binary serialization SHALL NOT be considered canonical.

---

## JSON Example

```json
{
  "id": "LU-000142",
  "title": "Introduction to APIs",
  "status": "Published",
  "version": "1.0.0"
}
```

---

## YAML Example

```yaml
id: LU-000142
title: Introduction to APIs
status: Published
version: 1.0.0
```

---

# 3.14 Schema Versioning

Every schema SHALL include a version identifier.

Example

```text
1.0.0
```

Schema changes SHALL be classified as:

| Change | Compatibility |
|----------|--------------|
| New optional field | Backward compatible |
| New required field | Major change |
| Removed field | Major change |
| Renamed field | Major change |
| Metadata addition | Minor change |

---

# 3.15 Cross-Domain Schema Rules

Schemas SHALL remain interoperable across domains.

Example

```text
Learning Unit
      │
      ▼
Competency
      │
      ▼
Assessment
      │
      ▼
Certification
      │
      ▼
Career Role
```

Each entity SHALL preserve its own schema while participating in shared relationships.

---

# 3.16 Schema Compliance Checklist

Before publication every schema SHALL satisfy:

✓ Unique identifier

✓ Canonical naming

✓ Required attributes

✓ Valid metadata

✓ Lifecycle state

✓ Owner assigned

✓ Relationships validated

✓ No orphan references

✓ Version assigned

✓ Documentation completed

---

# 3.17 Normative Requirements

The following requirements are mandatory.

1. Every entity SHALL implement the canonical schema.
2. Every identifier SHALL remain globally unique.
3. Every relationship SHALL be explicitly modeled.
4. Attribute names SHALL follow lower camelCase.
5. Enumeration values SHALL use Academy-defined vocabularies.
6. Schemas SHALL be technology-independent.
7. Required attributes SHALL NOT be omitted.
8. Validation SHALL occur before publication.
9. Schema versions SHALL be maintained throughout the lifecycle.
10. Breaking schema changes SHALL require governance approval.

---

# 3.18 Summary

This chapter defines how every Academy entity is represented, validated, and related.

It establishes:

- canonical schemas
- identifiers
- naming conventions
- relationship models
- validation requirements
- serialization formats
- versioning rules

These standards ensure that every system within Simplicion Academy exchanges data consistently and remains interoperable over time.

The next chapter, **Chapter 4 — Metadata & Repository Standards**, defines the metadata model, repository organization, discovery mechanisms, tagging strategy, search optimization, and governance rules for all Academy assets.
