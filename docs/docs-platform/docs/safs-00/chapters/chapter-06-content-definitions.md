---
title: Chapter 6 — Content Object Definitions
description: Canonical definitions of all educational content objects used throughout Simplicion Academy.
sidebar_position: 6
slug: /safs/00/content-object-definitions
tags:
  - foundation
  - taxonomy
  - content
  - definitions
version: 1.0.0
status: Approved
owner: Simplicion Academy
classification: Internal
review_cycle: Every 6 Months
---

# Chapter 6 — Content Object Definitions

> **Every educational object within Simplicion Academy MUST have exactly one official definition.**

---

# 6.1 Purpose

This chapter establishes the canonical definitions for every educational content object used throughout the Simplicion Academy ecosystem.

These definitions are normative.

No future document may redefine these terms.

If additional educational objects are introduced, they MUST be added through the Foundation Standards governance process.

---

# 6.2 Educational Content Model

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
Learning Block
```

---

# 6.3 Learning Path

## Definition

A Learning Path is a structured collection of related Tracks designed to guide learners toward broader career, professional, or organizational goals.

## Purpose

Learning Paths organize long-term progression.

## Characteristics

- Contains multiple Tracks
- Defines recommended progression
- Optional for learners
- Supports different specialization routes

## Examples

- AI Engineering
- Startup Founder
- Product Leadership
- Marketing Excellence

---

# 6.4 Track

## Definition

A Track is a complete educational program designed to achieve one measurable outcome.

Tracks answer:

> "What capability will the learner possess after completion?"

## Characteristics

- Outcome-oriented
- Contains multiple Modules
- Includes assessments
- Includes projects
- May award certification

## Examples

- AI Full Stack Developer
- Startup Founder
- UI/UX Designer
- AI Product Manager

---

# 6.5 Module

## Definition

A Module is the primary reusable educational object responsible for teaching one major skill or competency.

Modules are designed for reuse across multiple Tracks.

## Characteristics

- Skill-focused
- Independent
- Reusable
- Versioned
- Self-contained

## Examples

- Prompt Engineering
- Git Fundamentals
- Customer Discovery
- API Development
- AI UI Design

---

# 6.6 Section

## Definition

A Section is a logical grouping of related Topics within a Module.

Sections improve organization and learner navigation.

Sections SHOULD NOT be reused independently.

---

## Example

Module

Prompt Engineering

Sections

- Foundations
- Prompt Patterns
- Advanced Prompting
- AI Agents

---

# 6.7 Topic

## Definition

A Topic teaches one clearly identifiable subject within a Section.

Topics divide larger concepts into manageable instructional units.

## Characteristics

- Narrow focus
- Independent objective
- Multiple Learning Units

---

## Example

Topic

Zero-Shot Prompting

Learning Units

- Definition
- Advantages
- Limitations
- Real Examples

---

# 6.8 Learning Unit

## Definition

The Learning Unit is the smallest independently teachable educational object.

Every Learning Unit should have exactly one primary learning objective.

---

## Required Components

Every Learning Unit MUST include:

- Learning Objective
- Instructional Content
- Practice
- Completion Criteria

Recommended:

- Examples
- Visuals
- References
- AI Assistance
- Reflection

---

# 6.9 Learning Block

## Definition

A Learning Block is the smallest reusable instructional component.

Learning Blocks cannot exist independently.

They always belong to one Learning Unit.

---

## Standard Learning Block Types

| Block | Purpose |
|---------|----------|
| Explanation | Teach concepts |
| Example | Demonstrate usage |
| Diagram | Visual understanding |
| Illustration | Simplify concepts |
| Image | Visual reference |
| Video | Multimedia learning |
| Code | Technical examples |
| AI Prompt | AI practice |
| Exercise | Hands-on learning |
| Reflection | Encourage thinking |
| Quiz | Knowledge check |
| Tip | Best practice |
| Warning | Common mistakes |
| Checklist | Verification |
| Download | Supporting asset |
| Template | Reusable artifact |
| Case Study | Real-world application |
| Reference | Further learning |

---

# 6.10 Relationships

The educational hierarchy follows strict parent-child relationships.

```text
Learning Path
    └── Track
            └── Module
                    └── Section
                            └── Topic
                                    └── Learning Unit
                                            └── Learning Blocks
```

An object MUST belong to exactly one parent.

---

# 6.11 Object Ownership

Every educational object MUST define:

- Owner
- Version
- Status
- Identifier
- Creation Date
- Review Date

Ownership ensures accountability throughout the lifecycle.

---

# 6.12 Lifecycle

Each content object progresses through the following lifecycle.

```text
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
Maintained
    │
    ▼
Deprecated
    │
    ▼
Archived
```

Lifecycle transitions are governed by SAFS-06 Governance & Lifecycle Standards.

---

# 6.13 Naming Rules

Educational objects SHOULD have concise, descriptive titles.

Preferred examples:

- Prompt Engineering
- Customer Discovery
- API Authentication

Avoid:

- Module 1
- Lesson A
- Miscellaneous
- Advanced Stuff

Titles should communicate intent without relying on surrounding context.

---

# 6.14 Compliance Rules

All educational objects MUST:

- Have one canonical definition.
- Have one parent.
- Have one immutable identifier.
- Be version controlled.
- Include required metadata.
- Align with the Academy taxonomy.

Objects failing these requirements MUST NOT be published.

---

# 6.15 Common Mistakes

Avoid:

- Creating oversized Modules.
- Mixing unrelated Topics.
- Splitting one concept across multiple Learning Units unnecessarily.
- Repeating the same content in different Modules.
- Creating Learning Blocks that cannot be reused.
- Omitting metadata or ownership.

---

# 6.16 Related Standards

- SAFS-00 — Academy Constitution
- SAFS-01 — Academy Architecture
- SAFS-02 — Data Standards
- SAFS-03 — Component Standards
- SAFS-05 — Content Standards
- SACOS Volume 01 — Curriculum Design

---

# Summary

This chapter establishes the official definitions of every educational content object within Simplicion Academy.

These definitions are canonical and form the foundation for curriculum design, software implementation, AI systems, analytics, governance, and future educational standards.

Future documents MUST reference these definitions rather than creating new ones.

---

## Next Chapter

➡️ **Chapter 7 — Assessment Object Definitions**
