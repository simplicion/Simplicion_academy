---
title: Chapter 12 — Metadata Definitions
description: Canonical metadata definitions and requirements for all educational objects within Simplicion Academy.
sidebar_position: 12
slug: /safs/00/metadata-definitions
tags:
  - metadata
  - standards
  - foundation
  - governance
version: 1.0.0
status: Approved
owner: Simplicion Academy
classification: Internal
review_cycle: Every 6 Months
---

# Chapter 12 — Metadata Definitions

> **Metadata is the identity of every educational object. Without metadata, content cannot be organized, discovered, versioned, governed, or analyzed.**

---

# 12.1 Purpose

This chapter establishes the official metadata model used throughout Simplicion Academy.

Every educational object, asset, assessment, module, track, document, and supporting resource MUST include standardized metadata.

Metadata enables:

- Identification
- Organization
- Search
- Governance
- Analytics
- Version Control
- AI Processing
- Content Management

---

# 12.2 Metadata

## Definition

Metadata is structured information that describes an educational object without being part of its instructional content.

Metadata allows both humans and software systems to understand, classify, locate, and manage content efficiently.

---

# 12.3 Metadata Principles

Metadata within Simplicion Academy must be:

- Standardized
- Consistent
- Machine Readable
- Human Readable
- Searchable
- Version Controlled
- Extensible

---

# 12.4 Required Metadata

Every educational object MUST include the following metadata.

| Metadata Field | Required | Description |
|----------------|----------|-------------|
| Object ID | Yes | Immutable unique identifier |
| Title | Yes | Official display name |
| Description | Yes | Brief summary |
| Object Type | Yes | Module, Topic, Assessment, Asset, etc. |
| Version | Yes | Current version number |
| Status | Yes | Lifecycle status |
| Owner | Yes | Responsible team or individual |
| Language | Yes | Primary content language |
| Created Date | Yes | Initial creation date |
| Last Updated | Yes | Most recent modification date |
| Review Date | Yes | Scheduled review date |
| Tags | Yes | Search and categorization keywords |

---

# 12.5 Recommended Metadata

The following metadata SHOULD be included whenever applicable.

| Metadata Field | Purpose |
|----------------|---------|
| Difficulty Level | Learner expectation |
| Estimated Duration | Learning planning |
| Learning Objectives | Educational outcomes |
| Competencies | Skills developed |
| Prerequisites | Required knowledge |
| Related Objects | Cross-linking |
| Assessment Links | Evaluation mapping |
| Certification Mapping | Credential relationship |
| Thumbnail | Visual representation |
| Author | Original creator |

---

# 12.6 Lifecycle Metadata

Every object MUST define its lifecycle state.

Approved lifecycle values are:

| Status | Description |
|---------|-------------|
| Draft | Under development |
| Review | Awaiting approval |
| Approved | Officially accepted |
| Published | Available to learners |
| Maintained | Actively supported |
| Deprecated | Scheduled for retirement |
| Archived | Retained for historical purposes |

No other lifecycle values are permitted without approval through Foundation Standards governance.

---

# 12.7 Version Metadata

Every object MUST include a version number.

Versioning follows Semantic Versioning principles.

| Version | Meaning |
|----------|---------|
| Major | Breaking structural changes |
| Minor | New content or functionality |
| Patch | Corrections and minor improvements |

Examples:

- 1.0.0
- 1.2.0
- 2.0.0

---

# 12.8 Ownership Metadata

Every object MUST identify an owner.

Ownership establishes accountability for:

- Accuracy
- Maintenance
- Review
- Updates
- Approval

Ownership may be assigned to:

- Individual
- Team
- Department
- Academy Function

---

# 12.9 Classification Metadata

Objects MAY include classification metadata.

Examples include:

- Internal
- Public
- Draft
- Confidential
- Experimental

Classification determines visibility and access permissions.

---

# 12.10 Language Metadata

Every educational object MUST specify its primary language.

Examples:

- English
- Hindi
- Spanish
- French
- Arabic

Future translations should reference the same immutable Object ID while maintaining separate language metadata.

---

# 12.11 Relationship Metadata

Objects SHOULD define relationships with other educational objects.

Relationship examples include:

- Parent Object
- Child Object
- Related Module
- Related Topic
- Prerequisite
- Successor
- Alternative Resource

Relationship metadata improves navigation, AI recommendations, and curriculum mapping.

---

# 12.12 Search Metadata

Search metadata improves discoverability.

Recommended fields include:

- Tags
- Keywords
- Categories
- Skill Area
- Industry Domain
- Career Role
- Difficulty

Search metadata should remain concise, relevant, and standardized.

---

# 12.13 Analytics Metadata

Objects MAY include analytics metadata.

Examples:

- Completion Rate
- Average Time
- Assessment Performance
- Learner Satisfaction
- Usage Frequency
- Engagement Metrics

Analytics metadata supports continuous improvement but does not replace educational quality review.

---

# 12.14 Metadata Quality Rules

Metadata MUST satisfy the following requirements.

- Complete
- Accurate
- Current
- Consistent
- Structured
- Validated
- Traceable

Incomplete metadata prevents effective governance and discovery.

---

# 12.15 Common Mistakes

Avoid:

- Missing Object IDs.
- Duplicate titles without unique identifiers.
- Inconsistent tags.
- Outdated review dates.
- Missing ownership.
- Incorrect lifecycle status.
- Incomplete descriptions.

---

# 12.16 Related Standards

- SAFS-00 — Academy Constitution
- SAFS-02 — Data Standards
- SAFS-03 — Component Standards
- SAFS-05 — Content Standards
- SACOS Volume 02 — Content Production
- SACOS Volume 10 — Publishing Standards

---

# Summary

Metadata provides the structural foundation that enables every educational object within Simplicion Academy to be identified, managed, searched, analyzed, versioned, and governed consistently.

Every educational object published by Simplicion Academy MUST conform to the metadata requirements established in this chapter.

---

## Next Chapter

➡️ **Chapter 13 — Naming Standards**
