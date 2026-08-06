---
title: Chapter 5 — Data Lifecycle
description: Defines the complete lifecycle, governance, versioning, archival, retention, and retirement processes for all Academy data.
sidebar_position: 5
slug: /safs/02/chapter-05-data-lifecycle
tags:
  - data
  - lifecycle
  - governance
version: 1.0.0
status: Approved
owner: Simplicion Academy
classification: Internal
review_cycle: Every 6 Months
---

# Chapter 5 — Data Lifecycle

> **Normative**
>
> Every data object managed by Simplicion Academy SHALL follow the lifecycle defined in this chapter. No object SHALL bypass lifecycle governance.

---

# 5.1 Purpose

Data is not static.

Every object evolves throughout its lifetime.

A Learning Unit may begin as an idea, become published, later be revised, eventually deprecated, and finally archived.

Without lifecycle governance:

- outdated information remains available,
- duplicate records appear,
- AI consumes obsolete content,
- reports become inaccurate,
- governance breaks down.

This chapter defines how every Academy object progresses from creation to retirement.

---

# 5.2 Lifecycle Principles

Every lifecycle SHALL follow these principles.

## Principle 1 — Controlled Evolution

Every object SHALL progress through approved lifecycle states.

Objects SHALL NOT skip mandatory governance stages.

---

## Principle 2 — Traceability

Every lifecycle transition SHALL be recorded.

Required information includes:

- actor
- timestamp
- previous state
- new state
- reason
- approval reference

---

## Principle 3 — Version Preservation

Historical versions SHALL remain recoverable.

Published versions SHALL NEVER be overwritten.

---

## Principle 4 — Auditability

Every lifecycle event SHALL be auditable.

Audit records SHALL remain immutable.

---

## Principle 5 — Controlled Retirement

Retiring an object SHALL preserve historical references.

Retirement SHALL NOT invalidate completed learner records or issued certifications.

---

# 5.3 Universal Lifecycle Model

All Academy objects SHALL follow the canonical lifecycle.

```text
Idea
  │
  ▼
Draft
  │
  ▼
Review
  │
  ▼
Approved
  │
  ▼
Published
  │
  ▼
Active
  │
  ▼
Maintenance
  │
  ▼
Revision
  │
  ▼
Deprecated
  │
  ▼
Archived
  │
  ▼
Retired
```

Domain-specific lifecycles MAY extend this model but SHALL NOT contradict it.

---

# 5.4 Lifecycle States

## Idea

Represents an initial concept.

Characteristics:

- not implemented
- not reviewable
- no production identifier required

---

## Draft

Object has been created.

Characteristics:

- editable
- incomplete
- internal visibility

Draft objects SHALL NOT be visible to learners.

---

## Review

Object is undergoing evaluation.

Typical reviewers include:

- curriculum reviewers
- technical reviewers
- accessibility reviewers
- AI reviewers

Changes SHOULD be minimized during review.

---

## Approved

The object satisfies all governance requirements.

Approval SHALL include:

- reviewer confirmation
- owner approval
- governance validation

---

## Published

The object becomes available for production use.

Published objects SHALL receive:

- publication timestamp
- official version
- immutable identifier

---

## Active

The object is currently in operational use.

Active objects MAY receive:

- metadata updates
- analytical updates
- relationship updates

without requiring structural redesign.

---

## Maintenance

Represents routine improvements.

Examples:

- typo correction
- accessibility improvements
- metadata updates
- broken link fixes

Maintenance SHALL preserve backward compatibility.

---

## Revision

Represents significant improvement.

Examples:

- new learning outcomes
- updated curriculum
- competency changes
- major content expansion

Revisions SHALL generate new versions.

---

## Deprecated

The object remains available but SHOULD NOT be used in new implementations.

Deprecated objects SHALL include:

- replacement reference
- deprecation reason
- deprecation date

---

## Archived

Archived objects become read-only.

Archived objects SHALL remain discoverable for governance purposes.

---

## Retired

Represents permanent removal from active operations.

Retired objects SHALL remain historically referenceable where required by governance or compliance.

---

# 5.5 Lifecycle Transitions

Every transition SHALL be explicitly approved.

Allowed transitions include:

```text
Idea
  │
  ▼
Draft
  │
  ▼
Review
  │
  ▼
Approved
  │
  ▼
Published
  │
  ▼
Active
  │
  ▼
Maintenance
  │
  ▼
Revision
  │
  ▼
Published
```

or

```text
Active
  │
  ▼
Deprecated
  │
  ▼
Archived
  │
  ▼
Retired
```

Skipping lifecycle states SHALL NOT be permitted.

---

# 5.6 Ownership During Lifecycle

Every lifecycle stage SHALL have a responsible owner.

| Stage | Primary Owner |
|--------|---------------|
| Idea | Author |
| Draft | Author |
| Review | Reviewer |
| Approved | Domain Owner |
| Published | Publisher |
| Active | Maintainer |
| Revision | Editor |
| Deprecated | Domain Owner |
| Archived | Repository Owner |
| Retired | Governance Board |

Ownership SHALL transfer through approved governance processes.

---

# 5.7 Version Management

Every significant revision SHALL generate a new version.

Semantic Versioning SHALL be used.

Examples

```text
1.0.0

1.1.0

1.2.0

2.0.0
```

Version history SHALL remain permanently available.

---

## Version Types

### Major

Breaking changes

Example

```text
2.0.0
```

---

### Minor

Backward-compatible improvements

```text
1.3.0
```

---

### Patch

Corrections only

```text
1.3.2
```

---

# 5.8 Change Categories

Changes SHALL be classified.

Examples

| Category | Example |
|----------|----------|
| Editorial | Grammar |
| Metadata | Keywords |
| Structural | New sections |
| Educational | New objectives |
| Assessment | Updated rubric |
| AI | Prompt improvements |
| Security | Classification update |

Different change categories MAY require different approval workflows.

---

# 5.9 Data Retention

Retention SHALL balance operational needs with governance obligations.

Retention policies SHALL define:

- minimum retention period
- archival conditions
- legal holds
- deletion eligibility

Example

| Object | Minimum Retention |
|----------|------------------|
| Learning Units | Permanent |
| Assessments | Permanent |
| Audit Logs | 7 years |
| Analytics Events | Domain-defined |
| Temporary Files | 90 days |

---

# 5.10 Archival Standards

Archived objects SHALL:

- remain immutable
- preserve metadata
- preserve identifiers
- preserve relationships
- remain searchable by administrators

Archived objects SHALL NOT be editable.

---

# 5.11 Deletion Policy

Deletion SHALL be exceptional.

Preferred order:

```text
Active
  │
  ▼
Deprecated
  │
  ▼
Archived
  │
  ▼
Retired
```

Physical deletion SHALL occur only when:

- legally required,
- approved by governance,
- no historical dependency exists.

---

# 5.12 Recovery

Repositories SHALL support recovery.

Recovery SHALL preserve:

- identifiers
- metadata
- relationships
- versions
- governance history

Recovery operations SHALL be logged.

---

# 5.13 Backup Standards

Repositories SHALL maintain scheduled backups.

Backups SHALL include:

- metadata
- content
- relationships
- versions
- audit logs

Backups SHALL be periodically tested.

---

# 5.14 Lifecycle Monitoring

Lifecycle metrics SHALL be monitored.

Examples

- Draft age
- Review duration
- Approval duration
- Publication frequency
- Revision frequency
- Deprecated object count
- Archive growth

These metrics support operational planning.

---

# 5.15 Lifecycle Validation

Before publication every object SHALL satisfy:

✓ Required metadata

✓ Valid identifier

✓ Owner assigned

✓ Relationships validated

✓ Accessibility reviewed

✓ Quality reviewed

✓ AI metadata complete

✓ Version assigned

✓ Governance approval

---

# 5.16 Exception Management

Lifecycle exceptions SHALL require documented approval.

Examples

- emergency publication
- accelerated retirement
- legal removal
- compliance override

Every exception SHALL record:

- reason
- approver
- duration
- corrective actions

---

# 5.17 Normative Requirements

The following requirements are mandatory.

1. Every object SHALL follow the canonical lifecycle.
2. Every lifecycle transition SHALL be recorded.
3. Published versions SHALL remain immutable.
4. Deprecated objects SHALL identify replacements where applicable.
5. Version history SHALL be preserved.
6. Archived objects SHALL remain recoverable.
7. Physical deletion SHALL require governance approval.
8. Backup procedures SHALL be maintained.
9. Lifecycle metrics SHALL be monitored.
10. Exceptions SHALL be documented and auditable.

---

# 5.18 Chapter Summary

This chapter establishes the lifecycle framework governing every Academy data object.

It defines:

- lifecycle states
- transition rules
- ownership
- version management
- retention
- archival
- recovery
- deletion
- monitoring
- governance

Together with Chapters 1–4, these standards ensure that Academy data remains accurate, traceable, secure, and maintainable throughout its entire lifecycle.

The next chapter, **Chapter 6 — AI & Analytics Data**, defines the standards for AI-ready datasets, embeddings, prompts, knowledge bases, analytics events, metrics, dashboards, reporting, and intelligent data services within Simplicion Academy.
