---
title: Chapter 13 — Naming Standards
description: Official naming conventions and standards for educational objects, assets, documentation, and platform components within Simplicion Academy.
sidebar_position: 13
slug: /safs/00/naming-standards
tags:
  - naming
  - standards
  - governance
  - documentation
version: 1.0.0
status: Approved
owner: Simplicion Academy
classification: Internal
review_cycle: Every 6 Months
---

# Chapter 13 — Naming Standards

> **Consistent naming improves discoverability, readability, collaboration, automation, and long-term maintainability.**

---

# 13.1 Purpose

This chapter defines the official naming standards for every educational, technical, and documentation object within Simplicion Academy.

These standards ensure consistency across:

- Curriculum
- Documentation
- Platform
- APIs
- Databases
- AI Systems
- Analytics
- Internal Operations

All published objects MUST follow these naming rules.

---

# 13.2 Naming Principles

Names MUST be:

- Clear
- Descriptive
- Consistent
- Human Readable
- Machine Friendly
- Searchable
- Stable
- Professional

Names SHOULD communicate purpose without requiring additional context.

---

# 13.3 General Rules

Names MUST:

- Use proper spelling.
- Use Title Case for display names.
- Be concise.
- Describe one concept only.
- Avoid unnecessary abbreviations.
- Avoid ambiguity.

Names MUST NOT:

- Include version numbers.
- Include dates.
- Include temporary labels.
- Include personal names unless required.
- Use emojis or decorative symbols.

---

# 13.4 Educational Object Naming

Educational objects should clearly communicate their purpose.

| Object | Example |
|---------|---------|
| Learning Path | AI Engineering |
| Track | AI Full Stack Developer |
| Module | Prompt Engineering |
| Section | Prompt Foundations |
| Topic | Zero-Shot Prompting |
| Learning Unit | Writing Your First Prompt |

Avoid generic names such as:

- Module 1
- Lesson A
- Chapter One
- Miscellaneous
- Basics

---

# 13.5 Assessment Naming

Assessment titles should identify both the activity and its purpose.

Examples:

- Prompt Engineering Quiz
- API Authentication Assignment
- UI Design Project
- Final Module Assessment
- Capstone Project

---

# 13.6 Asset Naming

Assets should clearly identify their content.

Examples:

- REST API Cheat Sheet
- Wireframe Template
- Customer Interview Worksheet
- Prompt Library
- Design System Reference

---

# 13.7 Document Naming

Documentation should follow a consistent pattern.

Examples:

- Academy Architecture
- Data Standards
- Content Standards
- Assessment Guidelines
- Publishing Workflow

Avoid vague document names.

---

# 13.8 File Naming

Repository file names should use lowercase letters and hyphens.

Examples:

```
chapter-01-introduction.md

learning-hierarchy.mmd

module-template.md

content-review-checklist.md
```

Avoid:

```
Chapter1.docx

FINAL_NEW_FILE.md

My Document.md

temp-final-v3.docx
```

---

# 13.9 Folder Naming

Folders should represent logical groups.

Examples:

```
tracks/

modules/

assessments/

templates/

references/

assets/

images/

videos/
```

Folder names should use lowercase and hyphens where necessary.

---

# 13.10 Identifier Naming

Object identifiers are separate from display names.

Examples:

| Object | Identifier |
|---------|------------|
| Learning Path | LP-000001 |
| Track | TRK-000001 |
| Module | MOD-000001 |
| Section | SEC-000001 |
| Topic | TOP-000001 |
| Learning Unit | LU-000001 |
| Assessment | ASM-000001 |
| Asset | AST-000001 |

Identifiers MUST remain immutable.

Changing a display title MUST NOT change the identifier.

---

# 13.11 API Naming

API resources should use plural nouns.

Examples:

```
/tracks

/modules

/topics

/learning-units

/assessments
```

Operations should remain predictable and RESTful.

---

# 13.12 Database Naming

Database objects should follow consistent conventions.

Examples:

Tables

```
tracks

modules

topics

learning_units

assessments
```

Columns

```
module_id

created_at

updated_at

status

owner_id
```

---

# 13.13 Metadata Naming

Metadata keys should use consistent terminology.

Examples:

```
title

description

status

owner

version

createdDate

updatedDate

language
```

Metadata names should not vary across systems.

---

# 13.14 URL Naming

URLs should be concise and readable.

Examples:

```
/tracks/ai-full-stack-developer

/modules/prompt-engineering

/topics/zero-shot-prompting
```

URLs should avoid unnecessary words and remain stable over time.

---

# 13.15 Version Naming

Version numbers follow Semantic Versioning.

Examples:

```
1.0.0

1.1.0

1.2.4

2.0.0
```

Version numbers should not appear in object titles.

---

# 13.16 Reserved Words

The following educational terms are reserved.

- Academy
- Learning Path
- Track
- Module
- Section
- Topic
- Learning Unit
- Learning Block
- Assessment
- Project
- Resource
- Asset
- Competency
- Skill

Reserved words MUST be used only with their official definitions established in SAFS-00.

---

# 13.17 Naming Quality Checklist

Before publishing, verify that every name is:

- Descriptive
- Unique within its scope
- Properly capitalized
- Free from spelling errors
- Consistent with Foundation Standards
- Easy to understand
- Search friendly

---

# 13.18 Common Mistakes

Avoid:

- Generic names.
- Duplicate titles.
- Random abbreviations.
- Personal naming styles.
- Temporary labels.
- File names containing spaces.
- Inconsistent capitalization.
- Version numbers in titles.

---

# 13.19 Related Standards

- SAFS-00 — Academy Constitution
- SAFS-02 — Data Standards
- SAFS-03 — Component Standards
- SAFS-05 — Content Standards
- SACOS Volume 00 — Governance & Master Index
- SACOS Volume 10 — Publishing Standards

---

# Summary

Consistent naming is essential for maintaining a scalable educational ecosystem.

These standards ensure that learners, educators, developers, AI systems, and administrators can identify, reference, search, and manage educational objects without ambiguity.

All educational, technical, and operational artifacts within Simplicion Academy MUST follow the naming conventions defined in this chapter.

---

## Next Chapter

➡️ **Chapter 14 — Controlled Vocabulary**
