import { Request, Response } from 'express';
import { getPrisma } from '../lib/supabase';
import { NotificationService } from '../lib/notification-service';

function normalizeQuestionRow(row: any) {
  return {
    id: row.id,
    testId: row.testId,
    type: row.type,
    prompt: row.prompt,
    promptHindi: row.promptHindi || undefined,
    options: Array.isArray(row.options) ? row.options : [],
    correctOptionIds: Array.isArray(row.correctOptionIds) ? row.correctOptionIds : [],
    maxLength: row.maxLength ?? undefined,
    placeholder: row.placeholder || undefined,
    expectedAnswer: row.expectedAnswer || undefined,
    marks: Number(row.marks ?? 4),
    negativeMarks: Number(row.negativeMarks ?? 0),
    explanation: row.explanation || undefined,
    order: row.order ?? 0,
  };
}

export class CourseTestController {
  /**
   * GET /courses/:id/tests?studentId=<optional>&publishedOnly=<optional>
   */
  static async listCourseTests(req: Request, res: Response) {
    try {
      const { id: courseId } = req.params;
      const studentId = req.query.studentId as string | undefined;
      const publishedOnly = req.query.publishedOnly === 'true';

      const prisma = getPrisma();
      if (!prisma) return res.json({ success: true, tests: [] });

      const tests = await prisma.courseTest.findMany({
        where: {
          courseId,
          ...(publishedOnly ? { status: 'live' } : {}),
        },
        include: {
          questions: { orderBy: { order: 'asc' } },
          attempts: {
            select: {
              id: true,
              studentId: true,
              studentName: true,
              totalMarksScored: true,
              maxMarks: true,
              percentageScore: true,
              submittedAt: true,
            },
            orderBy: { submittedAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = tests.map((t) => {
        const attemptsCount = t.attempts.length;
        const avgPercentage =
          attemptsCount > 0
            ? Math.round(
                t.attempts.reduce((s, a) => s + Number(a.percentageScore || 0), 0) / attemptsCount
              )
            : 0;
        const studentLatestAttempt = studentId
          ? t.attempts.find((a) => a.studentId === studentId) || null
          : null;

        return {
          id: t.id,
          courseId: t.courseId,
          tenantSlug: t.tenantSlug,
          title: t.title,
          description: t.description,
          durationMinutes: t.durationMinutes,
          status: t.status,
          scope: t.scope,
          subjectId: t.subjectId,
          subjectTitle: t.subjectTitle,
          lessonId: t.lessonId,
          lessonTitle: t.lessonTitle,
          createdAt: t.createdAt,
          questionCount: t.questions.length,
          totalMarks: t.questions.reduce((s, q) => s + Number(q.marks || 0), 0),
          questions: t.questions.map(normalizeQuestionRow),
          attemptsCount,
          avgPercentage,
          studentLatestAttempt,
        };
      });

      return res.json({ success: true, tests: formatted });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /courses/:id/tests
   * Create a test linked to a specific Lesson, a whole Subject, or the entire Course
   */
  static async createCourseTest(req: Request, res: Response) {
    try {
      const { id: courseId } = req.params;
      const {
        title,
        description,
        durationMinutes = 30,
        status = 'live',
        subjectId,
        lessonId,
      } = req.body;

      if (!title?.trim()) {
        return res.status(400).json({ success: false, error: 'Test name is required.' });
      }

      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const course = await prisma.studioCourse.findUnique({
        where: { id: courseId },
        include: { enrollments: true },
      });
      if (!course) return res.status(404).json({ success: false, error: 'Course not found.' });

      let resolvedSubjectId: string | null = null;
      let resolvedSubjectTitle: string | null = null;
      let resolvedLessonId: string | null = null;
      let resolvedLessonTitle: string | null = null;
      let scope: 'course' | 'subject' | 'lesson' = 'course';

      if (subjectId) {
        const sub = await prisma.courseSubject.findUnique({ where: { id: subjectId } });
        if (sub) {
          resolvedSubjectId = sub.id;
          resolvedSubjectTitle = sub.title;
          scope = 'subject';
        }
      }

      if (lessonId) {
        const les = await prisma.courseLesson.findUnique({
          where: { id: lessonId },
          include: { subject: true },
        });
        if (les) {
          resolvedLessonId = les.id;
          resolvedLessonTitle = les.title;
          resolvedSubjectId = les.subjectId;
          resolvedSubjectTitle = les.subject?.title || resolvedSubjectTitle;
          scope = 'lesson';
        }
      }

      const created = await prisma.courseTest.create({
        data: {
          courseId,
          tenantSlug: course.tenantSlug,
          title: title.trim(),
          description: description?.trim() || null,
          durationMinutes: Math.max(1, Number(durationMinutes) || 30),
          status: status === 'draft' ? 'draft' : 'live',
          scope,
          subjectId: resolvedSubjectId,
          subjectTitle: resolvedSubjectTitle,
          lessonId: resolvedLessonId,
          lessonTitle: resolvedLessonTitle,
        },
        include: { questions: true },
      });

      return res.status(201).json({
        success: true,
        test: {
          ...created,
          questionCount: 0,
          totalMarks: 0,
          attemptsCount: 0,
          avgPercentage: 0,
        },
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /course-tests/:testId
   * Loads full test details + questions for Teacher Studio or Student Test Runner (/test?courseTestId=...)
   */
  static async getCourseTestDetail(req: Request, res: Response) {
    try {
      const { testId } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const test = await prisma.courseTest.findUnique({
        where: { id: testId },
        include: {
          course: { select: { id: true, title: true, tenantSlug: true } },
          questions: { orderBy: { order: 'asc' } },
          attempts: { orderBy: { submittedAt: 'desc' }, take: 50 },
        },
      });

      if (!test) return res.status(404).json({ success: false, error: 'Test not found.' });

      return res.json({
        success: true,
        test: {
          id: test.id,
          courseId: test.courseId,
          courseTitle: test.course?.title || 'Course',
          tenantSlug: test.tenantSlug,
          title: test.title,
          description: test.description,
          durationMinutes: test.durationMinutes,
          status: test.status,
          scope: test.scope,
          subjectId: test.subjectId,
          subjectTitle: test.subjectTitle,
          lessonId: test.lessonId,
          lessonTitle: test.lessonTitle,
          createdAt: test.createdAt,
        },
        questions: test.questions.map(normalizeQuestionRow),
        attempts: test.attempts,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * PATCH /course-tests/:testId
   * Update test title, duration, status, or re-link to any Subject / Lesson / Whole Course
   */
  static async updateCourseTest(req: Request, res: Response) {
    try {
      const { testId } = req.params;
      const { title, description, durationMinutes, status, subjectId, lessonId } = req.body;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const existing = await prisma.courseTest.findUnique({ where: { id: testId } });
      if (!existing) return res.status(404).json({ success: false, error: 'Test not found.' });

      const data: Record<string, any> = {};
      if (title && title.trim()) data.title = title.trim();
      if (description !== undefined) data.description = description?.trim() || null;
      if (durationMinutes !== undefined) data.durationMinutes = Math.max(1, Number(durationMinutes) || 30);
      if (status === 'live' || status === 'draft') data.status = status;

      if (subjectId !== undefined || lessonId !== undefined) {
        let resolvedSubjectId: string | null = null;
        let resolvedSubjectTitle: string | null = null;
        let resolvedLessonId: string | null = null;
        let resolvedLessonTitle: string | null = null;
        let scope: 'course' | 'subject' | 'lesson' = 'course';

        if (subjectId) {
          const sub = await prisma.courseSubject.findUnique({ where: { id: subjectId } });
          if (sub) {
            resolvedSubjectId = sub.id;
            resolvedSubjectTitle = sub.title;
            scope = 'subject';
          }
        }
        if (lessonId) {
          const les = await prisma.courseLesson.findUnique({
            where: { id: lessonId },
            include: { subject: true },
          });
          if (les) {
            resolvedLessonId = les.id;
            resolvedLessonTitle = les.title;
            resolvedSubjectId = les.subjectId;
            resolvedSubjectTitle = les.subject?.title || resolvedSubjectTitle;
            scope = 'lesson';
          }
        }

        data.scope = scope;
        data.subjectId = resolvedSubjectId;
        data.subjectTitle = resolvedSubjectTitle;
        data.lessonId = resolvedLessonId;
        data.lessonTitle = resolvedLessonTitle;
      }

      const updated = await prisma.courseTest.update({
        where: { id: testId },
        data,
        include: { questions: { orderBy: { order: 'asc' } } },
      });

      return res.json({
        success: true,
        test: {
          ...updated,
          questions: updated.questions.map(normalizeQuestionRow),
          questionCount: updated.questions.length,
        },
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * DELETE /course-tests/:testId
   */
  static async deleteCourseTest(req: Request, res: Response) {
    try {
      const { testId } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      await prisma.courseTest.delete({ where: { id: testId } });
      return res.json({ success: true, deletedId: testId });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /course-tests/:testId/questions
   */
  static async addQuestion(req: Request, res: Response) {
    try {
      const { testId } = req.params;
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
        negativeMarks = 1,
        explanation,
      } = req.body;

      if (!prompt?.trim()) {
        return res.status(400).json({ success: false, error: 'Question prompt is required.' });
      }

      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const test = await prisma.courseTest.findUnique({ where: { id: testId } });
      if (!test) return res.status(404).json({ success: false, error: 'Test not found.' });

      const count = await prisma.courseTestQuestion.count({ where: { testId } });
      const created = await prisma.courseTestQuestion.create({
        data: {
          testId,
          courseId: test.courseId,
          type,
          prompt: prompt.trim(),
          promptHindi: promptHindi?.trim() || null,
          options: Array.isArray(options) ? options : [],
          correctOptionIds: Array.isArray(correctOptionIds) ? correctOptionIds : [],
          maxLength: maxLength ? Number(maxLength) : null,
          placeholder: placeholder?.trim() || null,
          expectedAnswer: expectedAnswer?.trim() || null,
          marks: Number(marks) || 4,
          negativeMarks: Number(negativeMarks) || 0,
          explanation: explanation?.trim() || null,
          order: count,
        },
      });

      return res.status(201).json({ success: true, question: normalizeQuestionRow(created) });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * PUT /course-tests/:testId/questions/:questionId
   */
  static async updateQuestion(req: Request, res: Response) {
    try {
      const { questionId } = req.params;
      const {
        type,
        prompt,
        promptHindi,
        options,
        correctOptionIds,
        maxLength,
        placeholder,
        expectedAnswer,
        marks,
        negativeMarks,
        explanation,
      } = req.body;

      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const updated = await prisma.courseTestQuestion.update({
        where: { id: questionId },
        data: {
          ...(type ? { type } : {}),
          ...(prompt?.trim() ? { prompt: prompt.trim() } : {}),
          ...(promptHindi !== undefined ? { promptHindi: promptHindi?.trim() || null } : {}),
          ...(Array.isArray(options) ? { options } : {}),
          ...(Array.isArray(correctOptionIds) ? { correctOptionIds } : {}),
          ...(maxLength !== undefined ? { maxLength: maxLength ? Number(maxLength) : null } : {}),
          ...(placeholder !== undefined ? { placeholder: placeholder?.trim() || null } : {}),
          ...(expectedAnswer !== undefined ? { expectedAnswer: expectedAnswer?.trim() || null } : {}),
          ...(marks !== undefined ? { marks: Number(marks) || 4 } : {}),
          ...(negativeMarks !== undefined ? { negativeMarks: Number(negativeMarks) || 0 } : {}),
          ...(explanation !== undefined ? { explanation: explanation?.trim() || null } : {}),
        },
      });

      return res.json({ success: true, question: normalizeQuestionRow(updated) });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * DELETE /course-tests/:testId/questions/:questionId
   */
  static async deleteQuestion(req: Request, res: Response) {
    try {
      const { questionId } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      await prisma.courseTestQuestion.delete({ where: { id: questionId } });
      return res.json({ success: true, deletedId: questionId });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /course-tests/:testId/submit
   * Evaluates all 6 flexible question types and persists CourseTestAttempt in Supabase
   */
  static async submitCourseTest(req: Request, res: Response) {
    try {
      const { testId } = req.params;
      const { studentId = 'guest', studentName = 'Student', answers = {} } = req.body;

      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const test = await prisma.courseTest.findUnique({
        where: { id: testId },
        include: { questions: { orderBy: { order: 'asc' } } },
      });
      if (!test) return res.status(404).json({ success: false, error: 'Test not found.' });

      const questions = test.questions.map(normalizeQuestionRow);
      let attempted = 0;
      let correct = 0;
      let incorrect = 0;
      let pendingReview = 0;
      let totalMarksScored = 0;
      let maxMarks = 0;

      const breakdown = questions.map((q) => {
        maxMarks += q.marks;
        const entry = answers[q.id] || {};
        const selectedOptionIds: string[] = Array.isArray(entry.selectedOptionIds)
          ? entry.selectedOptionIds
          : [];
        const textAnswer: string = typeof entry.textAnswer === 'string' ? entry.textAnswer.trim() : '';

        const isTextType = q.type === 'short_text' || q.type === 'long_text' || q.type === 'numeric';
        const isAttempted = isTextType ? textAnswer.length > 0 : selectedOptionIds.length > 0;

        if (!isAttempted) {
          return {
            questionId: q.id,
            status: 'unattempted',
            marksAwarded: 0,
            correctOptionIds: q.correctOptionIds,
            expectedAnswer: q.expectedAnswer,
            explanation: q.explanation,
          };
        }

        attempted++;

        if (isTextType) {
          if (!q.expectedAnswer) {
            pendingReview++;
            return {
              questionId: q.id,
              status: 'submitted_for_review',
              marksAwarded: 0,
              studentAnswer: textAnswer,
              textAnswer,
              explanation: q.explanation,
            };
          }
          const isMatch =
            q.type === 'numeric'
              ? Number(textAnswer) === Number(q.expectedAnswer)
              : textAnswer.toLowerCase() === q.expectedAnswer.toLowerCase();

          if (isMatch) {
            correct++;
            totalMarksScored += q.marks;
            return {
              questionId: q.id,
              status: 'correct',
              marksAwarded: q.marks,
              studentAnswer: textAnswer,
              textAnswer,
              expectedAnswer: q.expectedAnswer,
              explanation: q.explanation,
            };
          } else {
            incorrect++;
            totalMarksScored -= q.negativeMarks;
            return {
              questionId: q.id,
              status: 'incorrect',
              marksAwarded: -q.negativeMarks,
              studentAnswer: textAnswer,
              textAnswer,
              expectedAnswer: q.expectedAnswer,
              explanation: q.explanation,
            };
          }
        }

        // Radio, Checkbox, True/False
        const sortedSel = [...selectedOptionIds].sort();
        const sortedCorr = [...q.correctOptionIds].sort();
        const isExact =
          sortedSel.length === sortedCorr.length &&
          sortedSel.every((v, idx) => v === sortedCorr[idx]);

        if (isExact) {
          correct++;
          totalMarksScored += q.marks;
          return {
            questionId: q.id,
            status: 'correct',
            marksAwarded: q.marks,
            studentAnswer: selectedOptionIds,
            selectedOptionIds,
            correctOptionIds: q.correctOptionIds,
            explanation: q.explanation,
          };
        } else {
          incorrect++;
          totalMarksScored -= q.negativeMarks;
          return {
            questionId: q.id,
            status: 'incorrect',
            marksAwarded: -q.negativeMarks,
            studentAnswer: selectedOptionIds,
            selectedOptionIds,
            correctOptionIds: q.correctOptionIds,
            explanation: q.explanation,
          };
        }
      });

      const percentageScore =
        maxMarks > 0 ? Math.max(0, Math.round((totalMarksScored / maxMarks) * 100)) : 0;
      const accuracyPercent = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

      const scorecard = {
        totalQuestions: questions.length,
        attempted,
        unattempted: questions.length - attempted,
        correct,
        incorrect,
        pendingReview,
        totalMarksScored,
        maxMarks,
        maxPossibleMarks: maxMarks,
        percentageScore,
        accuracyPercent,
      };

      const attempt = await prisma.courseTestAttempt.create({
        data: {
          testId,
          courseId: test.courseId,
          studentId,
          studentName,
          answers,
          scorecard,
          totalMarksScored,
          maxMarks,
          percentageScore,
        },
      });

      return res.json({
        success: true,
        attemptId: attempt.id,
        scorecard,
        breakdown,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}
