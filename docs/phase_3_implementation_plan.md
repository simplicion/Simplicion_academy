# Phase 3 Implementation Plan: Student Study Hub, CBT Engine & Protected Learning

**Document Version:** 1.0.0  
**Parent Master Plan:** [Master Multi-Tenant Platform Implementation Plan](./master_implementation_plan.md)  
**Conformance:** SAFS-00, SAFS-01, SAFS-03, SAFS-04 (Design Standards), SAIS-04 (Learning Experience), PRD FR-STU, FR-ASSESS, FR-CONT, FR-MOD.  
**Execution Strategy:** **Frontend-First** (Study Hub UI, Unit Content Viewer with dynamic watermarking, CBT Exam Simulator with real examination palette, followed by backend integration and automated test validation).

---

## 1. Objectives & Scope of Phase 3

Phase 3 builds the core learning and assessment experience inside `apps/student-portal`:
1. **Authenticated Study Hub (`/study` & `/study/:offeringId`):**
   * Enrolled offerings overview with overall progress bars and continue-learning prompts.
   * Unit hierarchy list ("Let's Study") presenting subjects (English, Political Science, History, Geography, etc.).
   * Batch announcements and live class timetable.
2. **Unit Content Viewer (`/study/:offeringId/u/:unitId`):**
   * Dynamic content tiles conforming to PRD Section 6.7:
     * **Classes:** Video player with playback speed (1x, 1.25x, 1.5x, 2x), resume timestamps, and chapter notes.
     * **Notes & Documents:** In-browser secure reader with **dynamic text watermarking** (student's phone number and full name diagonally stamped across pages to prevent piracy).
     * **Sunday Full-Length CBT Mocks:** Direct launch into exam simulator.
     * **PYQ Solved Papers:** Previous year question sets.
     * **Current Affairs / Daily Updates:** Feed items.
3. **Computer-Based Test (CBT) Engine (Exam Mode):**
   * Full exam interface conforming to PRD FR-ASSESS-3:
     * Synchronized countdown timer with warning alerts at 5 minutes remaining.
     * Question palette with standardized color-coded states:
       * 🟩 Green: Answered
       * 🟥 Red: Not Answered
       * 🟪 Purple: Marked for Review
       * ⬜ Grey: Not Visited
     * Section navigation tabs (e.g. Domain Subjects vs General Aptitude).
     * Bilingual question view with instantaneous English / Hindi toggle.
     * Auto-submit on timer expiry and instantaneous result scorecard with solutions and accuracy analytics.
4. **WhatsApp Community Module Integration:**
   * Dynamic link generating WhatsApp deep-links with pre-filled student details:
     `https://wa.me/{number}?text={URL_encoded_message}`.
5. **Phase 3 Automated Test Suite:**
   * Unit tests for CBT question palette state transitions, score calculation with negative marking, and dynamic watermark generation.

---

## 2. Directory Layout & Components

```text
apps/student-portal/src/
├── app/
│   ├── study/
│   │   ├── page.tsx                       (Study Hub: Enrolled offerings & continue card)
│   │   ├── [offeringId]/
│   │   │   ├── page.tsx                   (Offering Study Hub: Units & modules)
│   │   │   ├── u/[unitId]/page.tsx        (Unit Content Viewer: Classes, Notes, Tests)
│   │   │   └── cbt/[testId]/page.tsx      (CBT Examination Simulator - Exam Mode)
│
├── components/
│   ├── StudyHeader.tsx                    (Study Hub navigation & back controls)
│   ├── UnitContentTiles.tsx               (Classes, Notes, Mocks, PYQs tiles)
│   ├── VideoPlayer.tsx                    (Lecture player with speeds & resume)
│   ├── WatermarkedDocumentViewer.tsx      (Anti-piracy watermarking viewer)
│   ├── CbtSimulator.tsx                   (NTA CUET CBT interface with timer & palette)
│   ├── CbtScorecard.tsx                   (Performance analysis, marks, accuracy)
│   └── CommunityCard.tsx                  (WhatsApp pre-filled group linker)
│
└── test/
    ├── cbt-engine.test.ts                 (CBT exam simulator & scoring tests)
    └── watermarking.test.ts               (Watermark generation & piracy protection tests)
```

---

## 3. Step-by-Step Execution Sequence

1. **Build Dynamic Watermarking Component (`WatermarkedDocumentViewer.tsx`):** Renders protected PDFs/documents with foreground diagonal watermarking displaying student name, phone, and timestamp.
2. **Build Video Player (`VideoPlayer.tsx`):** Playback speeds, chapter jumping, and progress persistence.
3. **Build CBT Examination Simulator (`CbtSimulator.tsx`):** Interactive exam runner with timer, question palette, bilingual toggle, mark for review, and auto-submit.
4. **Build CBT Scorecard (`CbtScorecard.tsx`):** Visual scorecard with correct/incorrect breakdown, accuracy percentage, and detailed solutions.
5. **Build Study Hub Pages:**
   * `/study`: Overview of enrolled batches.
   * `/study/:offeringId`: Unit list and enabled module tiles (WhatsApp community, doubts).
   * `/study/:offeringId/u/:unitId`: Content viewer displaying tiles for Classes, Notes, CBT Mocks.
   * `/study/:offeringId/cbt/:testId`: CBT exam launcher.
6. **Write & Run Automated Tests:** Verify CBT question palette state machine, exam auto-submit logic, and watermarking patterns.

