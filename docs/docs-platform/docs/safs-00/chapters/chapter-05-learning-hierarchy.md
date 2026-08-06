---
title: Chapter 5 — Learning Hierarchy
description: Defines the canonical educational hierarchy used throughout Simplicion Academy.
sidebar_position: 5
slug: /safs/00/learning-hierarchy
tags:
  - learning
  - hierarchy
  - architecture
  - taxonomy
version: 1.0.0
status: Approved
owner: Simplicion Academy
classification: Internal
review_cycle: Every 6 Months
---

# Chapter 5 — Learning Hierarchy

> **The Learning Hierarchy defines how knowledge is organized, delivered, tracked, assessed, and reused throughout Simplicion Academy.**

---

# 5.1 Purpose

This chapter establishes the canonical hierarchy for every educational experience delivered through Simplicion Academy.

Every learning object MUST belong to this hierarchy.

No educational object may exist outside this structure unless approved through the Foundation Standards governance process.

---

# 5.2 Learning Hierarchy

```text
Academy
│
└── Learning Path
      │
      └── Track
            │
            └── Module
                  │
                  └── Section
                        │
                        └── Topic
                              │
                              └── Learning Unit
                                    │
                                    ├── Learning Blocks
                                    ├── Activities
                                    ├── Assessments
                                    ├── Projects
                                    └── Resources
```

---

# 5.3 Hierarchy Overview

| Level | Object | Primary Purpose | Reusable |
|--------|---------|----------------|-----------|
| 1 | Academy | Complete learning ecosystem | No |
| 2 | Learning Path | Organize multiple Tracks around a broader goal | Yes |
| 3 | Track | Deliver a measurable outcome | Yes |
| 4 | Module | Teach a reusable skill | Yes |
| 5 | Section | Organize related Topics | No |
| 6 | Topic | Focus on a single subject | Yes |
| 7 | Learning Unit | Teach one specific concept or task | Yes |
| 8 | Learning Block | Atomic instructional component | Yes |

---

# 5.4 Academy

The Academy represents the complete Simplicion learning ecosystem.

It defines:

- Educational philosophy
- Standards
- Governance
- Platform
- Community
- Certifications
- Analytics

There is only one Academy within a deployment.

---

# 5.5 Learning Path

A Learning Path groups related Tracks into a recommended progression.

Examples:

- AI Engineering
- Startup & Entrepreneurship
- Product Management
- Digital Marketing

A learner MAY complete an entire Learning Path or choose individual Tracks.

---

# 5.6 Track

A Track represents a complete learning outcome.

Tracks answer the question:

> "What will the learner be able to achieve after completing this program?"

Examples:

- AI Full-Stack Developer
- Startup Founder
- UI/UX Designer
- Performance Marketer

A Track contains multiple reusable Modules.

Tracks SHOULD culminate in a capstone project or equivalent demonstration of competency.

---

# 5.7 Module

A Module teaches a reusable skill that can support one or more Tracks.

Examples:

- Prompt Engineering
- AI UI Design
- API Development
- Git & Version Control
- Customer Discovery

A Module is the primary reusable educational object within the academy.

Modules SHOULD NOT duplicate knowledge that already exists elsewhere.

---

# 5.8 Section

A Section organizes Topics into logical groups.

Example:

Module: Prompt Engineering

Sections:

- Foundations
- Prompt Patterns
- AI Workflows
- Automation
- Best Practices

Sections improve readability but are generally not reused independently.

---

# 5.9 Topic

A Topic focuses on one clearly defined subject.

Examples:

- Zero-Shot Prompting
- REST APIs
- Customer Interviews
- Design Systems

Topics SHOULD remain concise and focused.

Large Topics SHOULD be divided into multiple Topics.

---

# 5.10 Learning Unit

The Learning Unit is the smallest independently teachable instructional object.

Each Learning Unit should teach one concept, skill, or task.

Examples:

- Writing Your First Prompt
- Creating a REST Endpoint
- Conducting User Interviews
- Building a Wireframe

Learning Units are reusable across Tracks and Learning Paths.

---

# 5.11 Learning Blocks

Learning Blocks are the atomic instructional components that make up a Learning Unit.

Examples include:

- Explanation
- Example
- Diagram
- Image
- Video
- Code Sample
- AI Prompt
- Reflection
- Practice Exercise
- Quiz Question
- Download
- Template
- Checklist
- Case Study
- Reference

Learning Blocks SHOULD be designed for maximum reuse.

---

# 5.12 Activities

Activities enable learners to practice and reinforce knowledge.

Examples:

- Interactive exercises
- Reflection prompts
- Guided practice
- Peer discussions
- Simulations

Activities are formative and primarily support learning rather than evaluation.

---

# 5.13 Assessments

Assessments measure competency.

Assessment types include:

- Quiz
- Practical Task
- Assignment
- Coding Challenge
- Oral Assessment
- Peer Review
- Portfolio Review
- Final Examination

Assessment requirements are defined in SACOS Assessment Standards.

---

# 5.14 Projects

Projects require learners to integrate multiple skills into a meaningful outcome.

Projects SHOULD reflect real-world scenarios whenever practical.

Project difficulty should align with the learner's stage within the Track.

Tracks SHOULD include at least one capstone project.

---

# 5.15 Resources

Resources support learning but are not instructional objects themselves.

Examples:

- Templates
- Cheat Sheets
- Downloads
- Reading Lists
- Prompt Libraries
- Reference Documents
- External Links

Resources MAY be shared across multiple Modules.

---

# 5.16 Progress Tracking

Learner progress MAY be tracked at every hierarchical level.

Recommended levels:

- Learning Block
- Learning Unit
- Topic
- Section
- Module
- Track
- Learning Path

Progress aggregation rules are defined in SAFS-02 Data Standards.

---

# 5.17 Object Identity

Every educational object MUST have:

- A globally unique identifier.
- A title.
- A version.
- Required metadata.
- A lifecycle status.
- An owning team.

Object identifiers MUST remain immutable.

---

# 5.18 Rules

The following rules apply throughout the hierarchy:

- Every object MUST have one parent.
- Every object MUST define a clear purpose.
- Learning Units SHOULD teach one primary outcome.
- Modules SHOULD maximize reuse.
- Duplicate Topics SHOULD be avoided.
- Learning Blocks SHOULD remain atomic.
- Structural changes MUST follow the governance process.

---

# 5.19 Common Mistakes

Avoid the following:

- Turning Modules into full courses.
- Creating oversized Topics.
- Combining multiple concepts into a single Learning Unit.
- Duplicating instructional content.
- Embedding assessments without defined learning outcomes.
- Creating objects without metadata or identifiers.

---

# 5.20 Related Standards

- SAFS-00 — Academy Lexicon & Taxonomy
- SAFS-01 — Academy Architecture
- SAFS-02 — Data Standards
- SAFS-03 — Component Standards
- SAFS-05 — Content Standards
- SACOS Volume 1 — Curriculum Design

---

# Summary

The Learning Hierarchy defines the canonical structure of educational content within Simplicion Academy. It ensures consistency, scalability, reuse, and interoperability across curriculum, platform implementation, analytics, and AI systems.

Every educational object within the academy MUST conform to this hierarchy.

---

## Next Chapter

➡️ **Chapter 6 — Content Object Definitions**
