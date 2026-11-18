import { Request, Response } from 'express';
import { AttemptAggregate, Question, QuestionAnswerType } from '@simplicion/assessment';
import { getPrisma } from '../lib/supabase';

const attemptStore = new Map<string, AttemptAggregate>();

export interface StudioQuestionRecord {
  id: string;
  tenantSlug: string;
  type: QuestionAnswerType;
  prompt: string;
  promptHindi?: string;
  options: Array<{ id: string; text: string; textHindi?: string }>;
  correctOptionIds: string[];
  maxLength?: number;
  placeholder?: string;
  expectedAnswer?: string;
  marks: number;
  negativeMarks: number;
  explanation?: string;
  explanationHindi?: string;
}

// No hardcoded/mock seed questions — all questions are authored live by the educator in Supabase.
const DEFAULT_STUDIO_QUESTIONS: StudioQuestionRecord[] = [];

// In-memory fallback store (used in unit tests / offline mode)
const questionBankMemory = new Map<string, StudioQuestionRecord[]>();

function getMemoryQuestions(slug: string): StudioQuestionRecord[] {
  if (!questionBankMemory.has(slug)) {
    questionBankMemory.set(slug, []);
  }
  return questionBankMemory.get(slug)!;
}

function serializeDbOptions(q: StudioQuestionRecord) {
  return {
    items: q.options || [],
    maxLength: q.maxLength ?? null,
    placeholder: q.placeholder ?? null,
    expectedAnswer: q.expectedAnswer ?? null,
  };
}

function deserializeDbQuestion(row: any, tenantSlug: string): StudioQuestionRecord {
  const rawOptions = row.options;
  let items: Array<{ id: string; text: string; textHindi?: string }> = [];
  let maxLength: number | undefined;
  let placeholder: string | undefined;
  let expectedAnswer: string | undefined;

  if (Array.isArray(rawOptions)) {
    items = rawOptions.map((o: any) => ({
      id: o.id,
      text: o.text || o.textEn || '',
      textHindi: o.textHindi || o.textHi || undefined,
    }));
  } else if (rawOptions && typeof rawOptions === 'object') {
    items = Array.isArray(rawOptions.items) ? rawOptions.items : [];
    if (typeof rawOptions.maxLength === 'number') maxLength = rawOptions.maxLength;
    if (typeof rawOptions.placeholder === 'string') placeholder = rawOptions.placeholder;
    if (typeof rawOptions.expectedAnswer === 'string') expectedAnswer = rawOptions.expectedAnswer;
  }

  return {
    id: row.id,
    tenantSlug,
    type: (row.type as QuestionAnswerType) || 'single_choice',
    prompt: row.textEn,
    promptHindi: row.textHi || undefined,
    options: items,
    correctOptionIds: Array.isArray(row.correctOptionIds) ? row.correctOptionIds : [],
    maxLength,
    placeholder,
    expectedAnswer,
    marks: Number(row.marks ?? 4),
    negativeMarks: Number(row.negativeMarks ?? 0),
    explanation: row.explanationEn || undefined,
    explanationHindi: row.explanationHi || undefined,
  };
}

async function ensureDefaultTestInDb(prisma: any, tenantSlug: string) {
  const tenantId = `tenant_${tenantSlug.replace(/[^a-z0-9]/gi, '_')}`;
  let test = await prisma.test.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'asc' },
  });

  if (!test) {
    test = await prisma.test.create({
      data: {
        tenantId,
        title: 'Course Assessment',
        durationMinutes: 45,
        totalMarks: 100,
      },
    });
  }

  return test;
}

const sampleQuestions: Question[] = [
  {
    id: 'q1',
    type: 'single_choice',
    textEn: 'Which of the following is an essential element of a State according to political theory?',
    textHi: 'राजनीति विज्ञान के अनुसार निम्नलिखित में से कौन सा राज्य का आवश्यक तत्व है?',
    options: [
      { id: 'opt1', textEn: 'Sovereignty', textHi: 'संप्रभुता' },
      { id: 'opt2', textEn: 'Political Parties', textHi: 'राजनीतिक दल' },
      { id: 'opt3', textEn: 'Trade Unions', textHi: 'श्रमिक संघ' },
      { id: 'opt4', textEn: 'Constitution', textHi: 'संविधान' },
    ],
    correctOptionIds: ['opt1'],
    marks: 4,
    negativeMarks: 1,
    explanationEn: 'Sovereignty is the supreme, absolute, and uncontrollable power by which any independent state is governed.',
  },
  {
    id: 'q2',
    type: 'single_choice',
    textEn: 'In which year was the United Nations established?',
    textHi: 'संयुक्त राष्ट्र की स्थापना किस वर्ष हुई थी?',
    options: [
      { id: 'opt1', textEn: '1919', textHi: '1919' },
      { id: 'opt2', textEn: '1945', textHi: '1945' },
      { id: 'opt3', textEn: '1950', textHi: '1950' },
      { id: 'opt4', textEn: '1942', textHi: '1942' },
    ],
    correctOptionIds: ['opt2'],
    marks: 4,
    negativeMarks: 1,
    explanationEn: 'The United Nations was founded on 24 October 1945 after the end of World War II.',
  },
];

export class AssessmentController {
  /**
   * GET /cbt/questions
   * Fetches all flexible-type CBT questions for a tenant (backed by Supabase PostgreSQL)
   */
  static async listQuestions(req: Request, res: Response) {
    try {
      const slug = ((req.query.tenant as string) || req.tenant?.slug || 'cuet-humanities').toLowerCase();
      const prisma = getPrisma();

      if (prisma) {
        try {
          const test = await ensureDefaultTestInDb(prisma, slug);
          const rows = await prisma.question.findMany({
            where: { testId: test.id },
            orderBy: [{ order: 'asc' }, { id: 'desc' }],
          });
          return res.json({
            success: true,
            source: 'supabase',
            testId: test.id,
            testTitle: test.title,
            durationMinutes: test.durationMinutes,
            questions: rows.map((r) => deserializeDbQuestion(r, slug)),
          });
        } catch (dbErr: any) {
          console.warn('[Supabase DB] listQuestions fallback:', dbErr?.message);
        }
      }

      return res.json({
        success: true,
        source: 'memory',
        testId: 'test_default',
        testTitle: 'Live Practice & Mock Assessment',
        durationMinutes: 45,
        questions: getMemoryQuestions(slug),
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /cbt/questions
   * Creates any type of question (radio, checkboxes, short_text, long_text, true_false, numeric)
   * and persists it directly to Supabase PostgreSQL.
   */
  static async createQuestion(req: Request, res: Response) {
    try {
      const slug = ((req.body.tenantSlug as string) || req.tenant?.slug || 'cuet-humanities').toLowerCase();
      const {
        type = 'single_choice',
        prompt,
        promptHindi,
        options = [],
        correctOptionIds = [],
        maxLength,
        placeholder,
        expectedAnswer,
        marks = 4,
        negativeMarks = 0,
        explanation,
        explanationHindi,
      } = req.body;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ success: false, error: 'Question prompt is required.' });
      }

      const record: StudioQuestionRecord = {
        id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        tenantSlug: slug,
        type,
        prompt: prompt.trim(),
        promptHindi: promptHindi?.trim() || undefined,
        options: Array.isArray(options) ? options : [],
        correctOptionIds: Array.isArray(correctOptionIds) ? correctOptionIds : [],
        maxLength: maxLength ? Number(maxLength) : undefined,
        placeholder: placeholder?.trim() || undefined,
        expectedAnswer: expectedAnswer !== undefined ? String(expectedAnswer).trim() : undefined,
        marks: Number(marks) || 4,
        negativeMarks: Number(negativeMarks) || 0,
        explanation: explanation?.trim() || undefined,
        explanationHindi: explanationHindi?.trim() || undefined,
      };

      const prisma = getPrisma();
      if (prisma) {
        try {
          const test = await ensureDefaultTestInDb(prisma, slug);
          const count = await prisma.question.count({ where: { testId: test.id } });
          const created = await prisma.question.create({
            data: {
              testId: test.id,
              type: record.type,
              textEn: record.prompt,
              textHi: record.promptHindi || null,
              options: serializeDbOptions(record),
              correctOptionIds: record.correctOptionIds,
              marks: record.marks,
              negativeMarks: record.negativeMarks,
              explanationEn: record.explanation || null,
              explanationHi: record.explanationHindi || null,
              order: count,
            },
          });

          return res.status(201).json({
            success: true,
            persistedTo: 'supabase',
            question: deserializeDbQuestion(created, slug),
          });
        } catch (dbErr: any) {
          console.warn('[Supabase DB] createQuestion fallback:', dbErr?.message);
        }
      }

      const mem = getMemoryQuestions(slug);
      mem.unshift(record);
      return res.status(201).json({
        success: true,
        persistedTo: 'memory',
        question: record,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * PUT /cbt/questions/:id
   * Updates an existing question in Supabase PostgreSQL
   */
  static async updateQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const slug = ((req.body.tenantSlug as string) || req.tenant?.slug || 'cuet-humanities').toLowerCase();
      const {
        type = 'single_choice',
        prompt,
        promptHindi,
        options = [],
        correctOptionIds = [],
        maxLength,
        placeholder,
        expectedAnswer,
        marks = 4,
        negativeMarks = 0,
        explanation,
        explanationHindi,
      } = req.body;

      if (!prompt || !prompt.trim()) {
        return res.status(400).json({ success: false, error: 'Question prompt is required.' });
      }

      const record: StudioQuestionRecord = {
        id,
        tenantSlug: slug,
        type,
        prompt: prompt.trim(),
        promptHindi: promptHindi?.trim() || undefined,
        options: Array.isArray(options) ? options : [],
        correctOptionIds: Array.isArray(correctOptionIds) ? correctOptionIds : [],
        maxLength: maxLength ? Number(maxLength) : undefined,
        placeholder: placeholder?.trim() || undefined,
        expectedAnswer: expectedAnswer !== undefined ? String(expectedAnswer).trim() : undefined,
        marks: Number(marks) || 4,
        negativeMarks: Number(negativeMarks) || 0,
        explanation: explanation?.trim() || undefined,
        explanationHindi: explanationHindi?.trim() || undefined,
      };

      const prisma = getPrisma();
      if (prisma) {
        try {
          const updated = await prisma.question.update({
            where: { id },
            data: {
              type: record.type,
              textEn: record.prompt,
              textHi: record.promptHindi || null,
              options: serializeDbOptions(record),
              correctOptionIds: record.correctOptionIds,
              marks: record.marks,
              negativeMarks: record.negativeMarks,
              explanationEn: record.explanation || null,
              explanationHi: record.explanationHindi || null,
            },
          });

          return res.json({
            success: true,
            persistedTo: 'supabase',
            question: deserializeDbQuestion(updated, slug),
          });
        } catch (dbErr: any) {
          console.warn('[Supabase DB] updateQuestion fallback:', dbErr?.message);
        }
      }

      const mem = getMemoryQuestions(slug);
      const idx = mem.findIndex((q) => q.id === id);
      if (idx >= 0) mem[idx] = record;
      else mem.unshift(record);

      return res.json({
        success: true,
        persistedTo: 'memory',
        question: record,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * DELETE /cbt/questions/:id
   * Removes a question from Supabase PostgreSQL
   */
  static async deleteQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const slug = ((req.query.tenant as string) || req.tenant?.slug || 'cuet-humanities').toLowerCase();
      const prisma = getPrisma();

      if (prisma) {
        try {
          await prisma.question.delete({ where: { id } });
          return res.json({ success: true, deletedId: id, source: 'supabase' });
        } catch (dbErr: any) {
          console.warn('[Supabase DB] deleteQuestion fallback:', dbErr?.message);
        }
      }

      const mem = getMemoryQuestions(slug);
      questionBankMemory.set(
        slug,
        mem.filter((q) => q.id !== id)
      );
      return res.json({ success: true, deletedId: id, source: 'memory' });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /cbt/submit
   * Grades any mix of Radio, Checkboxes, Short Text, Long Text, True/False, and Numerical answers
   */
  static async submitLiveTest(req: Request, res: Response) {
    try {
      const slug = ((req.body.tenantSlug as string) || req.tenant?.slug || 'cuet-humanities').toLowerCase();
      const { answers = {} } = req.body as {
        answers: Record<string, { selectedOptionIds?: string[]; textAnswer?: string }>;
      };

      let questions: StudioQuestionRecord[] = [];
      const prisma = getPrisma();

      if (prisma) {
        try {
          const test = await ensureDefaultTestInDb(prisma, slug);
          const rows = await prisma.question.findMany({
            where: { testId: test.id },
            orderBy: [{ order: 'asc' }, { id: 'desc' }],
          });
          questions = rows.map((r) => deserializeDbQuestion(r, slug));
        } catch {
          questions = getMemoryQuestions(slug);
        }
      } else {
        questions = getMemoryQuestions(slug);
      }

      let attempted = 0;
      let correct = 0;
      let incorrect = 0;
      let pendingReview = 0;
      let totalMarksScored = 0;
      let maxPossibleMarks = 0;

      const breakdown = questions.map((q) => {
        maxPossibleMarks += q.marks;
        const ans = answers[q.id];
        const selectedIds = ans?.selectedOptionIds || [];
        const textVal = (ans?.textAnswer || '').trim();

        const isTextOrNum = q.type === 'short_text' || q.type === 'long_text' || q.type === 'numeric';
        const isAttempted = isTextOrNum ? textVal.length > 0 : selectedIds.length > 0;

        if (!isAttempted) {
          return {
            questionId: q.id,
            status: 'unattempted',
            marksAwarded: 0,
            studentAnswer: isTextOrNum ? textVal : selectedIds,
            expectedAnswer: q.expectedAnswer || null,
            correctOptionIds: q.correctOptionIds,
            explanation: q.explanation || null,
          };
        }

        attempted++;

        if (q.type === 'short_text' || q.type === 'long_text') {
          if (q.expectedAnswer && q.expectedAnswer.trim()) {
            const normalizedStudent = textVal.toLowerCase().replace(/\s+/g, ' ');
            const normalizedExpected = q.expectedAnswer.toLowerCase().replace(/\s+/g, ' ');
            const matched =
              normalizedStudent === normalizedExpected ||
              (q.type === 'long_text' && normalizedStudent.includes(normalizedExpected));

            if (matched) {
              correct++;
              totalMarksScored += q.marks;
              return {
                questionId: q.id,
                status: 'correct',
                marksAwarded: q.marks,
                studentAnswer: textVal,
                expectedAnswer: q.expectedAnswer,
                explanation: q.explanation || null,
              };
            }
            incorrect++;
            totalMarksScored -= q.negativeMarks;
            return {
              questionId: q.id,
              status: 'incorrect',
              marksAwarded: -q.negativeMarks,
              studentAnswer: textVal,
              expectedAnswer: q.expectedAnswer,
              explanation: q.explanation || null,
            };
          }

          // Open-ended text/essay without fixed auto-grade answer
          pendingReview++;
          return {
            questionId: q.id,
            status: 'submitted_for_review',
            marksAwarded: 0,
            studentAnswer: textVal,
            expectedAnswer: q.expectedAnswer || null,
            explanation: q.explanation || null,
          };
        }

        if (q.type === 'numeric') {
          const expectedNum = Number(q.expectedAnswer);
          const studentNum = Number(textVal);
          const matched =
            Number.isFinite(expectedNum) &&
            Number.isFinite(studentNum) &&
            Math.abs(studentNum - expectedNum) < 0.0001;

          if (matched) {
            correct++;
            totalMarksScored += q.marks;
            return {
              questionId: q.id,
              status: 'correct',
              marksAwarded: q.marks,
              studentAnswer: textVal,
              expectedAnswer: q.expectedAnswer || null,
              explanation: q.explanation || null,
            };
          }
          incorrect++;
          totalMarksScored -= q.negativeMarks;
          return {
            questionId: q.id,
            status: 'incorrect',
            marksAwarded: -q.negativeMarks,
            studentAnswer: textVal,
            expectedAnswer: q.expectedAnswer || null,
            explanation: q.explanation || null,
          };
        }

        // single_choice (radio), multiple_choice (checkboxes), true_false
        const isCorrect =
          q.correctOptionIds.length === selectedIds.length &&
          q.correctOptionIds.every((id) => selectedIds.includes(id));

        if (isCorrect) {
          correct++;
          totalMarksScored += q.marks;
          return {
            questionId: q.id,
            status: 'correct',
            marksAwarded: q.marks,
            studentAnswer: selectedIds,
            correctOptionIds: q.correctOptionIds,
            explanation: q.explanation || null,
          };
        }

        incorrect++;
        totalMarksScored -= q.negativeMarks;
        return {
          questionId: q.id,
          status: 'incorrect',
          marksAwarded: -q.negativeMarks,
          studentAnswer: selectedIds,
          correctOptionIds: q.correctOptionIds,
          explanation: q.explanation || null,
        };
      });

      const gradedAttempted = correct + incorrect;
      const accuracyPercent = gradedAttempted > 0 ? Math.round((correct / gradedAttempted) * 100) : 0;
      const clampedScore = Math.max(0, totalMarksScored);
      const percentageScore =
        maxPossibleMarks > 0 ? Math.round((clampedScore / maxPossibleMarks) * 100) : 0;

      return res.json({
        success: true,
        scorecard: {
          totalQuestions: questions.length,
          attempted,
          correct,
          incorrect,
          pendingReview,
          unattempted: questions.length - attempted,
          totalMarksScored: clampedScore,
          maxPossibleMarks,
          accuracyPercent,
          percentageScore,
        },
        breakdown,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /tests/:id/start
   * Starts a CBT attempt and initializes the exam timer
   */
  static async startTest(req: Request, res: Response) {
    try {
      const tenant = req.tenant;
      if (!tenant) return res.status(404).json({ success: false, error: 'Tenant context required.' });

      const { id } = req.params;
      const userId = (req.body.userId as string) || 'demo-user-1';

      const attempt = AttemptAggregate.start(
        `att-${Date.now()}`,
        tenant.id,
        id,
        userId,
        60
      );

      attemptStore.set(attempt.id, attempt);

      return res.json({
        success: true,
        attemptId: attempt.id,
        durationMinutes: 60,
        questions: sampleQuestions.map(({ correctOptionIds, ...q }) => q),
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /attempts/:id/submit
   * Submits answers and computes instant CBT scorecard
   */
  static async submitAttempt(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { answers } = req.body;

      const attempt = attemptStore.get(id);
      if (!attempt) {
        return res.status(404).json({ success: false, error: 'Attempt not found.' });
      }

      if (Array.isArray(answers)) {
        for (const ans of answers) {
          attempt.recordAnswer({
            questionId: ans.questionId,
            selectedOptionIds: ans.selectedOptionIds || [],
            timeSpentSeconds: ans.timeSpentSeconds || 0,
            isMarkedForReview: !!ans.isMarkedForReview,
          });
        }
      }

      const scorecard = attempt.submit(sampleQuestions);

      return res.json({
        success: true,
        scorecard,
        status: attempt.status,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}
