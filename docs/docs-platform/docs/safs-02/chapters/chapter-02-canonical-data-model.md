---
title: Chapter 2 — Canonical Data Model
description: Defines the canonical entities, identifiers, relationships, and structural rules for every managed object within Simplicion Academy.
sidebar_position: 2
slug: /safs/02/chapter-02-canonical-data-model
tags:
  - data
  - canonical-model
  - entities
version: 1.0.0
status: Approved
owner: Simplicion Academy
classification: Internal
review_cycle: Every 6 Months
---

# Chapter 2 — Canonical Data Model

> **Normative**
>
> This chapter establishes the official Canonical Data Model (CDM) for Simplicion Academy. Every service, application, repository, API, AI capability, and analytical process SHALL use these canonical definitions.

---

# 2.1 Purpose

The Canonical Data Model provides a common language for every Academy system.

It ensures that:

- every entity has one official definition,
- every relationship is explicitly defined,
- every identifier is globally unique,
- every implementation interprets data consistently,
- AI systems consume structured information,
- integrations remain stable over time.

The Canonical Data Model is implementation-independent and MUST NOT be coupled to any specific database, framework, programming language, or vendor.

---

# 2.2 Canonical Entity Hierarchy

The Academy organizes educational information into a hierarchical structure.

```text
Academy
│
├── Learning Path
│   ├── Track
│   │   ├── Module
│   │   │   ├── Section
│   │   │   │   ├── Topic
│   │   │   │   │   ├── Learning Unit
│   │   │   │   │   │   ├── Learning Block
│   │   │   │   │   │   ├── Activity
│   │   │   │   │   │   └── Assessment
```

Every educational object SHALL exist within this hierarchy.

---

# 2.3 Entity Categories

The Academy defines the following canonical entity categories.

| Category | Purpose |
|----------|---------|
| Educational | Curriculum and learning |
| Assessment | Evaluation |
| Competency | Skills and outcomes |
| Career | Career pathways |
| User | People and identities |
| Organization | Institutions and teams |
| Repository | Documents and assets |
| AI | AI knowledge and services |
| Analytics | Metrics and reporting |
| Governance | Policies and operational records |

Every canonical entity SHALL belong to one primary category.

---

# 2.4 Canonical Entity Template

Every entity defined within the Academy SHALL follow a standard specification.

```text
Entity Name

Purpose

Definition

Responsibilities

Parent

Children

Relationships

Required Attributes

Optional Attributes

Lifecycle

Validation Rules

Metadata

Security Classification

Examples
```

This template ensures consistency across all entity definitions.

---

# 2.5 Educational Entities

## Academy

### Purpose

Represents the complete Simplicion Academy ecosystem.

### Identifier Prefix

```text
ACD-
```

### Parent

None

### Children

- Learning Paths
- Organizations
- Repository
- Governance Objects

### Required Attributes

| Attribute | Required |
|-----------|----------|
| id | Yes |
| name | Yes |
| version | Yes |
| status | Yes |

---

## Learning Path

### Identifier Prefix

```text
LP-
```

### Definition

A Learning Path is the highest-level structured educational journey designed to achieve a defined career or competency outcome.

### Parent

Academy

### Children

- Tracks

### Required Attributes

| Attribute | Type |
|-----------|------|
| id | String |
| title | String |
| description | String |
| version | String |
| status | Enum |
| difficulty | Enum |
| estimatedDuration | Duration |

### Relationships

- contains Tracks
- maps to Career Paths
- maps to Competencies

---

## Track

### Identifier Prefix

```text
TRK-
```

### Definition

A Track groups related modules within a Learning Path.

### Parent

Learning Path

### Children

- Modules

### Required Attributes

- id
- title
- description
- sequence
- version
- status

---

## Module

### Identifier Prefix

```text
MOD-
```

### Definition

A Module is a collection of Sections focused on a specific subject area.

### Parent

Track

### Children

- Sections

### Required Attributes

- id
- title
- summary
- learningObjectives
- estimatedDuration
- version

---

## Section

### Identifier Prefix

```text
SEC-
```

### Definition

A Section groups related Topics within a Module.

### Parent

Module

### Children

- Topics

---

## Topic

### Identifier Prefix

```text
TOP-
```

### Definition

A Topic represents a discrete subject that can be taught independently.

### Parent

Section

### Children

- Learning Units

---

## Learning Unit

### Identifier Prefix

```text
LU-
```

### Definition

A Learning Unit is the smallest independently deliverable instructional object.

### Parent

Topic

### Children

- Learning Blocks
- Activities
- Assessments

### Required Attributes

| Attribute | Description |
|-----------|-------------|
| id | Unique identifier |
| title | Display title |
| description | Summary |
| prerequisites | Required prior knowledge |
| outcomes | Expected learning outcomes |
| competencyIds | Linked competencies |
| duration | Estimated completion time |
| difficulty | Difficulty level |
| language | Primary language |
| version | Version number |
| status | Lifecycle state |

### Relationships

- belongs to one Topic
- supports one or more Competencies
- contains Learning Blocks
- contains Activities
- may reference Resources
- may include Assessments

---

## Learning Block

### Identifier Prefix

```text
LB-
```

### Definition

A Learning Block is the smallest reusable instructional element within a Learning Unit.

Examples include:

- explanation
- example
- code sample
- diagram
- note
- warning
- tip
- exercise
- reflection

Learning Blocks SHOULD be reusable across multiple Learning Units.

---

## Activity

### Identifier Prefix

```text
ACT-
```

### Definition

An Activity requires learner participation to reinforce learning.

Examples include:

- practice
- simulation
- discussion
- coding exercise
- worksheet
- experiment

Activities MAY contribute to assessment but are not assessments themselves.

---

## Assessment

### Identifier Prefix

```text
ASM-
```

### Definition

An Assessment measures learner achievement against defined outcomes and competencies.

Assessment types include:

- Quiz
- Assignment
- Practical Task
- Project
- Peer Review
- Oral Assessment
- Final Examination

Each Assessment SHALL define:

- learning outcomes
- competencies
- grading criteria
- passing criteria
- submission requirements
- feedback model

---

# 2.6 Entity Relationship Principles

All relationships SHALL be explicitly defined.

Supported relationship types include:

```text
Parent Of

Child Of

Prerequisite

Successor

Depends On

References

Implements

Uses

Maps To

Related To
```

Circular parent-child relationships SHALL NOT exist.

---

# 2.7 Canonical Naming Rules

Every entity SHALL have:

- a singular name,
- a stable identifier,
- a human-readable title,
- a machine-readable slug.

Examples:

```text
Learning Path
LP-000001

Module
MOD-000104

Assessment
ASM-000025
```

Identifiers SHALL never be reused after retirement.

---

# 2.8 Competency Domain Entities

The Competency Domain defines the knowledge, skills, and abilities that learners develop throughout their educational journey.

Competencies provide the connection between curriculum, assessments, certifications, and career outcomes.

Every educational object SHALL map to one or more competencies.

---

## Competency

### Identifier Prefix

```text
CMP-
```

### Definition

A Competency is a measurable capability that a learner can demonstrate after completing one or more educational experiences.

Competencies SHALL be:

- measurable
- observable
- assessable
- reusable
- technology independent

### Parent

Competency Framework

### Children

- Skills
- Learning Outcomes

### Required Attributes

| Attribute | Description |
|------------|-------------|
| id | Unique identifier |
| title | Competency name |
| description | Canonical definition |
| domain | Competency domain |
| level | Proficiency level |
| version | Current version |
| status | Lifecycle state |

### Relationships

A Competency MAY be linked to:

- Learning Paths
- Modules
- Learning Units
- Assessments
- Certifications
- Career Roles

---

## Skill

### Identifier Prefix

```text
SKL-
```

### Definition

A Skill represents a specific capability contributing to a Competency.

Examples:

- Programming
- Communication
- Debugging
- Public Speaking
- Data Analysis

Multiple Skills MAY contribute to one Competency.

---

## Learning Outcome

### Identifier Prefix

```text
OUT-
```

### Definition

A Learning Outcome describes what a learner will know or be able to demonstrate after completing instruction.

Every Learning Outcome SHALL:

- begin with an observable verb
- be measurable
- map to one or more competencies
- support one or more assessments

Examples:

- Explain REST APIs
- Build a responsive web page
- Analyze financial statements

---

# 2.9 Career Domain Entities

The Career Domain connects learning with employability.

---

## Career Domain

### Identifier Prefix

```text
CRD-
```

Represents a broad professional discipline.

Examples:

- Software Engineering
- Artificial Intelligence
- Cybersecurity
- Product Management
- Marketing

---

## Career Path

### Identifier Prefix

```text
CRP-
```

### Definition

A structured progression of competencies leading toward a profession.

Example:

```text
Software Engineering
        │
        ▼
Frontend Development
        │
        ▼
React Developer
        │
        ▼
Senior Frontend Engineer
```

---

## Career Role

### Identifier Prefix

```text
CRR-
```

### Definition

Represents a specific professional role.

Examples:

- Backend Engineer
- UI Designer
- AI Engineer
- DevOps Engineer
- Product Manager

Every Career Role SHALL define:

- required competencies
- recommended learning paths
- recommended certifications
- expected proficiency

---

## Certification

### Identifier Prefix

```text
CRT-
```

### Definition

Represents formal recognition of competency achievement.

Required attributes include:

- issuing authority
- competencies covered
- issue date
- expiration (optional)
- credential identifier

---

## Badge

### Identifier Prefix

```text
BDG-
```

### Definition

A Badge recognizes completion of smaller achievements.

Badges SHALL NOT replace Certifications.

---

# 2.10 User Domain Entities

The User Domain represents all individuals interacting with the Academy.

---

## User

### Identifier Prefix

```text
USR-
```

### Definition

A generic identity representing any authenticated individual.

### Parent

None

### Children

- Learner
- Instructor
- Mentor
- Administrator

### Required Attributes

- id
- fullName
- email
- language
- timezone
- status

---

## Learner

### Identifier Prefix

```text
LRN-
```

### Definition

Represents an individual participating in learning.

### Additional Attributes

- enrollments
- completedLearningUnits
- competencies
- certifications
- badges
- portfolio

---

## Instructor

### Identifier Prefix

```text
INS-
```

### Definition

Responsible for instructional delivery.

### Additional Responsibilities

- author content
- review assessments
- mentor learners
- evaluate projects

---

## Mentor

### Identifier Prefix

```text
MEN-
```

### Definition

Provides guidance outside formal instruction.

Mentors MAY participate in:

- discussions
- reviews
- career coaching
- project feedback

---

## Administrator

### Identifier Prefix

```text
ADM-
```

### Definition

Responsible for governance and operational administration.

---

# 2.11 Organization Domain

---

## Organization

### Identifier Prefix

```text
ORG-
```

### Definition

Represents an institution participating in the Academy.

Examples:

- University
- Company
- Training Partner
- Government Agency

---

## Team

### Identifier Prefix

```text
TEAM-
```

### Definition

Represents a collaborative group within an organization.

Teams MAY own:

- workspaces
- projects
- repositories

---

## Workspace

### Identifier Prefix

```text
WS-
```

### Definition

A Workspace provides an isolated collaborative environment.

Contains:

- members
- documents
- discussions
- projects
- resources

---

# 2.12 Repository Domain

Repository entities manage educational assets.

---

## Resource

### Identifier Prefix

```text
RES-
```

### Definition

Any reusable educational material.

Examples:

- article
- worksheet
- reference
- template
- dataset

---

## Asset

### Identifier Prefix

```text
AST-
```

### Definition

Represents digital media.

Examples:

- image
- video
- audio
- presentation
- PDF
- source code

Assets SHALL include:

- owner
- license
- version
- checksum
- metadata

---

## Document

### Identifier Prefix

```text
DOC-
```

### Definition

Represents structured textual information.

Examples:

- Standard
- SOP
- Policy
- Guide
- Handbook

---

# 2.13 AI Domain

The AI Domain contains entities supporting intelligent services.

---

## AI Agent

### Identifier Prefix

```text
AIA-
```

### Definition

Represents an autonomous AI service.

Examples:

- Tutor
- Reviewer
- Mentor
- Evaluator
- Search Agent

---

## Prompt

### Identifier Prefix

```text
PRM-
```

### Definition

Reusable instruction templates for AI.

Prompts SHALL be version controlled.

---

## Knowledge Base

### Identifier Prefix

```text
KB-
```

### Definition

Structured repository of information available to AI systems.

---

## Embedding

### Identifier Prefix

```text
EMB-
```

### Definition

Vector representation of structured information.

Embeddings SHALL reference their originating content.

---

## Conversation

### Identifier Prefix

```text
CNV-
```

### Definition

Represents interactions between users and AI systems.

Conversation history SHALL preserve:

- timestamps
- participants
- prompts
- responses
- citations

---

# 2.14 Analytics Domain

Analytics entities measure Academy performance.

---

## Analytics Event

### Identifier Prefix

```text
EVT-
```

### Definition

Represents a recorded learner or system event.

Examples:

- Login
- Lesson Started
- Lesson Completed
- Assessment Submitted
- Badge Earned

---

## Dashboard

### Identifier Prefix

```text
DSH-
```

### Definition

Visual presentation of KPIs.

---

## Report

### Identifier Prefix

```text
RPT-
```

### Definition

Structured analytical output.

Reports MAY be:

- scheduled
- on-demand
- real-time

---

# 2.15 Governance Domain

Governance entities control Academy operations.

---

## Policy

### Identifier Prefix

```text
POL-
```

Represents organizational rules.

---

## Standard

### Identifier Prefix

```text
STD-
```

Represents normative requirements.

---

## Procedure

### Identifier Prefix

```text
SOP-
```

Represents step-by-step operational processes.

---

## Audit

### Identifier Prefix

```text
AUD-
```

Represents governance verification activities.

---

## Risk

### Identifier Prefix

```text
RSK-
```

Represents identified organizational risks.

---

# 2.16 Cross-Domain Relationships

The Canonical Data Model SHALL support relationships across domains.

Example:

```text
Learning Path
        │
        ▼
Module
        │
        ▼
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

Additional cross-domain relationships include:

- Learner ↔ Enrollment ↔ Learning Path
- Instructor ↔ Module ↔ Assessment
- Organization ↔ Workspace ↔ Project
- AI Agent ↔ Knowledge Base ↔ Prompt
- Analytics Event ↔ Dashboard ↔ Report

Every relationship SHALL specify:

- source entity
- target entity
- relationship type
- cardinality
- lifecycle dependency

---

# 2.17 Canonical Rules

The following rules are mandatory.

1. Every entity SHALL have one globally unique identifier.
2. Identifier prefixes SHALL remain stable across versions.
3. Entity definitions SHALL be implementation-independent.
4. Parent-child hierarchies SHALL NOT contain cycles.
5. Canonical entities SHALL NOT be duplicated.
6. Relationships SHALL be explicitly modeled.
7. Deprecated entities SHALL remain referenceable but SHALL NOT be reused.
8. All entities SHALL include lifecycle metadata defined in SAFS-02.
9. Every entity SHALL include ownership metadata defined in SAFS-06.
10. All future Academy entities SHALL extend this Canonical Data Model rather than introducing parallel models.

---

# 2.18 Chapter Summary

This chapter defines the official Canonical Data Model for Simplicion Academy. It establishes the core entities, identifiers, domains, and relationships that every platform, repository, AI capability, and governance process SHALL use.

The next chapter, **Chapter 3 — Data Schema & Relationships**, builds upon these entity definitions by specifying canonical schemas, attribute standards, cardinality rules, metadata structures, validation requirements, and serialization formats for implementation.
