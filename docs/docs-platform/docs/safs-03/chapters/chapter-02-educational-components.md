---
title: Chapter 2 — Educational Components
description: Defines the canonical architecture, specifications, interfaces, relationships, lifecycle, and governance of all reusable educational components within Simplicion Academy.
sidebar_position: 2
slug: /safs/03/chapter-02-educational-components
tags:
  - education
  - learning
  - curriculum
  - components
version: 1.0.0
status: Approved
owner: Simplicion Academy
classification: Internal
review_cycle: Every 6 Months
---

# Chapter 2 — Educational Components

> **Normative**
>
> Every educational capability within Simplicion Academy SHALL be represented using the canonical educational components defined in this chapter. Educational content SHALL NOT introduce custom structural elements outside the approved Academy hierarchy.

---

# 2.1 Purpose

Educational Components are the core instructional building blocks of Simplicion Academy.

They define **what learners study**, **how knowledge is organized**, **how competencies are achieved**, and **how learning experiences are delivered**.

Every curriculum, certification, learning pathway, and AI tutor relies upon these canonical educational components.

---

# 2.2 Objectives

This chapter establishes standards for:

- Educational architecture
- Learning hierarchy
- Component specifications
- Learning composition
- Assessment integration
- Competency mapping
- AI compatibility
- Accessibility
- Reusability
- Governance

---

# 2.3 Educational Architecture

The Academy SHALL organize educational content using the following hierarchy.

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
    ├── Learning Blocks
    ├── Activities
    └── Assessments
```

No educational object SHALL bypass this hierarchy.

---

# 2.4 Educational Component Categories

Educational components are classified into:

| Category | Purpose |
|-----------|---------|
| Curriculum | Organizes learning |
| Instruction | Delivers knowledge |
| Practice | Reinforces understanding |
| Assessment | Measures achievement |
| Competency | Defines measurable capability |
| Certification | Validates completion |

---

# 2.5 Learning Path

A Learning Path represents a complete educational journey toward a defined objective.

A Learning Path SHALL include:

- identifier
- title
- description
- target audience
- estimated duration
- competencies
- Tracks
- completion criteria
- certification mapping

A Learning Path SHALL NOT directly contain Learning Units.

---

# 2.6 Track

Tracks divide a Learning Path into specialized areas.

Examples include:

```text
Software Engineering
         │
         ├── Frontend Development
         ├── Backend Development
         ├── DevOps
         └── Cloud Engineering
```

Each Track SHALL:

- belong to exactly one Learning Path
- contain one or more Modules
- define measurable outcomes

---

# 2.7 Module

Modules organize related knowledge.

Each Module SHALL define:

- learning objectives
- prerequisites
- Sections
- competencies
- assessments
- estimated duration

Modules SHALL remain independently maintainable.

---

# 2.8 Section

Sections divide Modules into manageable instructional groups.

A Section SHALL:

- group related Topics
- maintain logical progression
- preserve instructional continuity

Sections SHALL NOT directly contain Activities.

---

# 2.9 Topic

Topics organize individual concepts.

Each Topic SHALL include:

- concept overview
- related Learning Units
- prerequisite Topics
- competency mappings

Topics SHOULD remain focused on one primary subject.

---

# 2.10 Learning Unit

The Learning Unit is the smallest independently deliverable educational component.

Every Learning Unit SHALL include:

- objectives
- explanation
- examples
- activities
- assessments
- completion criteria

Learning Units SHALL be reusable across multiple Learning Paths.

---

# 2.11 Learning Blocks

Learning Blocks are reusable instructional elements inside Learning Units.

Supported Learning Blocks include:

| Learning Block | Purpose |
|----------------|---------|
| Introduction | Context |
| Concept | Explanation |
| Example | Demonstration |
| Illustration | Visual understanding |
| Code Example | Technical instruction |
| Exercise | Practice |
| Reflection | Critical thinking |
| Summary | Reinforcement |
| References | Additional learning |

Learning Blocks SHALL NOT exist independently of Learning Units.

---

# 2.12 Activities

Activities reinforce learning through interaction.

Supported Activity types include:

- Quiz
- Exercise
- Discussion
- Project
- Case Study
- Reflection
- Coding Lab
- Simulation
- Research Task

Activities SHALL define:

- objectives
- instructions
- expected outcomes
- estimated duration

---

# 2.13 Assessments

Assessments evaluate learning achievement.

Assessment types include:

- Diagnostic
- Formative
- Summative
- Practical
- Peer Review
- Oral
- Final Examination

Every Assessment SHALL define:

- competency mappings
- scoring rules
- passing criteria
- feedback strategy

---

# 2.14 Competencies

Competencies describe measurable learner capabilities.

Every Competency SHALL define:

- identifier
- description
- proficiency level
- assessment mappings
- related Learning Units
- career mappings

Competencies SHALL remain implementation independent.

---

# 2.15 Learning Outcomes

Learning Outcomes describe what learners are expected to achieve.

Every Learning Outcome SHALL be:

- observable
- measurable
- assessable
- competency aligned

Example

```text
After completing this Learning Unit,
the learner can design a REST API
using HTTP standards.
```

---

# 2.16 Certification Components

Certifications validate successful completion.

Every Certification SHALL specify:

- eligibility
- required competencies
- required assessments
- validity
- issuing authority

Certificates SHALL reference completed Learning Paths.

---

# 2.17 Educational Relationships

Educational relationships SHALL remain explicit.

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
      │
      ▼
Competency
      │
      ▼
Certification
```

No circular educational dependencies SHALL exist.

---

# 2.18 Educational Metadata

Every educational component SHALL include:

- identifier
- title
- description
- objectives
- prerequisites
- estimated duration
- language
- version
- lifecycle status
- accessibility information
- competency mappings

Metadata SHALL comply with SAFS-02.

---

# 2.19 Accessibility

Educational Components SHALL support inclusive learning.

Accessibility requirements include:

- alternative text
- keyboard navigation
- captions
- transcripts
- readable typography
- semantic structure
- screen reader compatibility

Accessibility SHALL be evaluated before publication.

---

# 2.20 AI Compatibility

Educational Components SHALL support AI-driven services.

Each component SHOULD provide:

- semantic metadata
- structured learning objectives
- competency mappings
- prerequisite information
- embeddings
- search metadata

AI systems SHALL consume canonical educational metadata.

---

# 2.21 Component Validation

Every Educational Component SHALL pass validation.

Validation includes:

✓ Structure

✓ Metadata

✓ Relationships

✓ Accessibility

✓ Competency mappings

✓ Assessment mappings

✓ Lifecycle status

✓ Governance approval

---

# 2.22 Governance

Educational Components SHALL be governed through:

- curriculum review
- instructional review
- accessibility review
- AI review
- governance approval

Changes SHALL follow the lifecycle defined in SAFS-06.

---

# 2.23 Normative Requirements

The following requirements are mandatory.

1. Educational content SHALL follow the canonical Academy hierarchy.
2. Learning Units SHALL be independently reusable.
3. Every educational component SHALL include canonical metadata.
4. Learning Outcomes SHALL be measurable.
5. Competencies SHALL map to assessments.
6. Educational relationships SHALL remain explicit.
7. Accessibility SHALL be verified before publication.
8. AI metadata SHALL be maintained for educational components.
9. Educational components SHALL be version controlled.
10. Educational components SHALL undergo governance review before publication.

---

# 2.24 Chapter Summary

This chapter defines the canonical educational building blocks of Simplicion Academy.

It establishes:

- educational hierarchy
- curriculum components
- instructional components
- learning units
- learning blocks
- activities
- assessments
- competencies
- certifications
- accessibility
- AI compatibility
- governance

These standards ensure every learning experience across the Academy is consistent, reusable, measurable, AI-ready, and governed.

The next chapter, **Chapter 3 — Platform Components**, defines the reusable platform capabilities that power Academy applications, including navigation, authentication, dashboards, notifications, collaboration, search, workflows, integrations, and shared application services.
