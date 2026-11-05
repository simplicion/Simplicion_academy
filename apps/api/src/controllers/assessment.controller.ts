import { Request, Response } from 'express';
import { AttemptAggregate, Question } from '@simplicion/assessment';

const attemptStore = new Map<string, AttemptAggregate>();

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
        60 // 60 minutes
      );

      attemptStore.set(attempt.id, attempt);

      return res.json({
        success: true,
        attemptId: attempt.id,
        durationMinutes: 60,
        questions: sampleQuestions.map(({ correctOptionIds, ...q }) => q), // Hide correct answers during test
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
      const { answers } = req.body; // Array of { questionId, selectedOptionIds, timeSpentSeconds }

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

