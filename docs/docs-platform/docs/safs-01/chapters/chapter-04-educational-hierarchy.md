---
title: Chapter 4 — Educational Hierarchy
description: Official hierarchical architecture of educational objects within Simplicion Academy.
sidebar_position: 4
slug: /safs/01/educational-hierarchy
tags:
  - architecture
  - hierarchy
  - education
  - standards
version: 1.0.0
status: Approved
owner: Simplicion Academy
classification: Internal
review_cycle: Every 6 Months
---

# Chapter 4 — Educational Hierarchy

> **The Educational Hierarchy defines the official structural organization of every learning experience within Simplicion Academy. It establishes how educational objects are arranged, related, and composed into complete learning journeys.**

---

# 4.1 Purpose

This chapter defines the official educational hierarchy used throughout Simplicion Academy.

The hierarchy provides a standardized structure for organizing learning content from the highest organizational level down to the smallest instructional component.

Every educational object SHALL exist within this hierarchy.

---

# 4.2 Educational Hierarchy

The Academy follows a single canonical hierarchy.

```text
Academy
    │
    ▼
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
    │
    ▼
Learning Block
    │
    ▼
Activity
    │
    ▼
Assessment
```

This hierarchy SHALL be used consistently throughout the Academy.

---

# 4.3 Hierarchy Overview

| Level | Primary Purpose |
|--------|-----------------|
| Academy | Complete educational ecosystem |
| Learning Path | Collection of related Tracks |
| Track | Complete learning program |
| Module | Competency-focused learning component |
| Section | Logical grouping of Topics |
| Topic | Focused knowledge area |
| Learning Unit | Complete instructional experience |
| Learning Block | Smallest reusable instructional component |
| Activity | Guided learner practice |
| Assessment | Evaluation of learning outcomes |

---

# 4.4 Academy

The Academy represents the highest level of the educational architecture.

Responsibilities include:

- Educational governance
- Curriculum organization
- Standards enforcement
- Repository ownership
- Quality assurance

There is only one Academy within the architecture.

---

# 4.5 Learning Path

A Learning Path groups multiple related Tracks into a broader educational journey.

Characteristics:

- Goal-oriented
- Career aligned
- Expandable
- Reusable

Example:

```text
Learning Path
└── Artificial Intelligence
```

A Learning Path SHALL contain one or more Tracks.

---

# 4.6 Track

A Track represents a complete learning program leading to a defined competency or professional outcome.

Characteristics:

- Outcome focused
- Sequential
- Assessable
- Independently completable

Example:

```text
Track
└── AI Full Stack Developer
```

A Track SHALL belong to one Learning Path.

---

# 4.7 Module

A Module develops one major competency.

Characteristics:

- Skill-based
- Modular
- Reusable
- Independently maintainable

Example:

```text
Module
└── Prompt Engineering
```

A Module SHALL belong to one Track.

---

# 4.8 Section

A Section organizes related Topics within a Module.

Characteristics:

- Logical grouping
- Structural organization
- Navigation support

Example:

```text
Section
└── Prompt Fundamentals
```

A Section SHALL belong to one Module.

---

# 4.9 Topic

A Topic represents one focused subject area.

Characteristics:

- Single concept
- Clearly scoped
- Instructionally focused

Example:

```text
Topic
└── Zero-Shot Prompting
```

A Topic SHALL belong to one Section.

---

# 4.10 Learning Unit

The Learning Unit is the primary instructional object.

A Learning Unit should include:

- Learning objectives
- Instruction
- Examples
- Activities
- Resources
- Assessment

Example:

```text
Learning Unit
└── Writing Your First Zero-Shot Prompt
```

Every Topic SHALL contain one or more Learning Units.

---

# 4.11 Learning Block

A Learning Block is the smallest reusable instructional component.

Examples include:

- Explanation
- Example
- Demonstration
- Exercise
- Summary
- Code Sample
- Diagram
- Reflection

Learning Blocks may be reused across multiple Learning Units.

---

# 4.12 Activity

Activities provide learners with opportunities to apply knowledge.

Examples:

- Guided Exercise
- Practice Task
- Reflection
- Discussion
- Research
- Simulation

Activities reinforce learning before formal assessment.

---

# 4.13 Assessment

Assessments evaluate learning outcomes and competencies.

Examples:

- Knowledge Check
- Assignment
- Practical Task
- Project
- Final Assessment

Assessments should align directly with Learning Outcomes and Competencies.

---

# 4.14 Parent–Child Relationships

Every educational object has one defined parent within the hierarchy.

```text
Learning Path
    └── Track
            └── Module
                    └── Section
                            └── Topic
                                    └── Learning Unit
                                            └── Learning Block
```

Parent-child relationships SHALL remain consistent across the Academy.

---

# 4.15 Hierarchical Integrity

Educational objects shall not bypass hierarchy levels.

Invalid examples include:

- Module directly containing Learning Units.
- Track directly containing Topics.
- Section directly containing Activities.

Each object SHALL contain only its officially defined child objects.

---

# 4.16 Navigation Flow

Learners typically navigate the hierarchy as follows.

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
        │
        ▼
Activity
        │
        ▼
Assessment
```

Alternative navigation methods may exist but shall preserve the underlying hierarchy.

---

# 4.17 Reusability

Certain educational objects are designed for reuse.

Reusable objects include:

- Modules
- Learning Units
- Learning Blocks
- Assessments
- Resources
- Assets

Reuse should occur through references rather than duplication whenever practical.

---

# 4.18 Architectural Constraints

The educational hierarchy shall satisfy the following constraints.

- One Academy.
- One parent per educational object.
- Clearly defined child relationships.
- Immutable object identifiers.
- Standardized metadata.
- Consistent navigation.
- Governance integration.

These constraints preserve architectural consistency.

---

# 4.19 Common Mistakes

Avoid:

- Skipping hierarchy levels.
- Assigning multiple parents to the same object.
- Duplicating Learning Units across Topics.
- Mixing instructional and assessment responsibilities.
- Creating unofficial hierarchy levels.
- Embedding unrelated content within educational objects.

---

# 4.20 Related Standards

- SAFS-00 — Academy Constitution
- Chapter 3 — Academy Architecture Overview
- SAFS-02 — Data Standards
- SAFS-03 — Component Standards
- SAFS-05 — Content Standards
- SAFS-06 — Governance & Lifecycle Standards

---

# Summary

The Educational Hierarchy establishes the official structural framework of Simplicion Academy.

By defining standardized educational levels, parent-child relationships, navigation rules, and architectural constraints, the hierarchy provides a consistent and scalable foundation for organizing every learning experience across the Academy.

All educational content, curriculum, assessments, and supporting resources SHALL conform to the hierarchy defined in this chapter.

---

## Next Chapter

➡️ **Chapter 5 — Curriculum Architecture**
