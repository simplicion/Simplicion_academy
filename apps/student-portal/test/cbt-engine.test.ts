import { describe, it, expect } from 'vitest';
import { Question, Scorecard } from '@simplicion/assessment';

// Helper to run CBT scoring logic in test environment
export function computeCbtScore(
  questions: Question[],
  answers: Record<string, string[]>
): Scorecard {
  let attempted = 0;
  let correct = 0;
  let incorrect = 0;
  let totalMarks = 0;
  let maxMarks = 0;

  questions.forEach((q) => {
    maxMarks += q.marks;
    const userSelected = answers[q.id] || [];
    if (userSelected.length > 0) {
      attempted++;
      const isCorrect =
        q.correctOptionIds.length === userSelected.length &&
        q.correctOptionIds.every((id) => userSelected.includes(id));
      if (isCorrect) {
        correct++;
        totalMarks += q.marks;
      } else {
        incorrect++;
        totalMarks -= q.negativeMarks;
      }
    }
  });

  const unattempted = questions.length - attempted;
  const accuracyPercent = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  return {
    testId: 'mock-test',
    studentId: 'std_101',
    totalQuestions: questions.length,
    attempted,
    unattempted,
    correct,
    incorrect,
    totalMarks,
    maxMarks,
    accuracyPercent,
    timeTakenSeconds: 300,
  };
}

describe('CBT Simulator Engine & Scoring', () => {
  const mockQuestions: Question[] = [
    {
      id: 'q1',
      unitId: 'u1',
      tenantId: 'tenant_cuet',
      type: 'single_choice',
      prompt: 'Who was the founder of the Maurya Empire?',
      options: [
        { id: 'opt_1', text: 'Chandragupta Maurya' },
        { id: 'opt_2', text: 'Ashoka' },
      ],
      correctOptionIds: ['opt_1'],
      marks: 4,
      negativeMarks: 1,
    },
    {
      id: 'q2',
      unitId: 'u1',
      tenantId: 'tenant_cuet',
      type: 'single_choice',
      prompt: 'Which Ashokan edict mentions the Kalinga War?',
      options: [
        { id: 'opt_3', text: 'Major Rock Edict XIII' },
        { id: 'opt_4', text: 'Pillar Edict VII' },
      ],
      correctOptionIds: ['opt_3'],
      marks: 4,
      negativeMarks: 1,
    },
    {
      id: 'q3',
      unitId: 'u1',
      tenantId: 'tenant_cuet',
      type: 'single_choice',
      prompt: 'What was Megasthenes\' work called?',
      options: [
        { id: 'opt_5', text: 'Indica' },
        { id: 'opt_6', text: 'Arthashastra' },
      ],
      correctOptionIds: ['opt_5'],
      marks: 4,
      negativeMarks: 1,
    },
  ];

  it('computes 100% score when all attempted questions are correct', () => {
    const answers = {
      q1: ['opt_1'],
      q2: ['opt_3'],
      q3: ['opt_5'],
    };

    const scorecard = computeCbtScore(mockQuestions, answers);
    expect(scorecard.attempted).toBe(3);
    expect(scorecard.correct).toBe(3);
    expect(scorecard.incorrect).toBe(0);
    expect(scorecard.totalMarks).toBe(12);
    expect(scorecard.maxMarks).toBe(12);
    expect(scorecard.accuracyPercent).toBe(100);
  });

  it('applies NTA CUET negative marking correctly (+4 for correct, -1 for incorrect)', () => {
    const answers = {
      q1: ['opt_1'], // Correct: +4
      q2: ['opt_4'], // Incorrect: -1
      // q3 is unattempted: 0
    };

    const scorecard = computeCbtScore(mockQuestions, answers);
    expect(scorecard.attempted).toBe(2);
    expect(scorecard.unattempted).toBe(1);
    expect(scorecard.correct).toBe(1);
    expect(scorecard.incorrect).toBe(1);
    expect(scorecard.totalMarks).toBe(3); // 4 - 1 = 3
    expect(scorecard.maxMarks).toBe(12);
    expect(scorecard.accuracyPercent).toBe(50);
  });

  it('handles negative total marks gracefully when incorrect answers exceed correct ones', () => {
    const answers = {
      q1: ['opt_2'], // Incorrect: -1
      q2: ['opt_4'], // Incorrect: -1
    };

    const scorecard = computeCbtScore(mockQuestions, answers);
    expect(scorecard.attempted).toBe(2);
    expect(scorecard.unattempted).toBe(1);
    expect(scorecard.correct).toBe(0);
    expect(scorecard.incorrect).toBe(2);
    expect(scorecard.totalMarks).toBe(-2);
    expect(scorecard.accuracyPercent).toBe(0);
  });

  it('preserves zero marks if no questions were attempted', () => {
    const answers = {};

    const scorecard = computeCbtScore(mockQuestions, answers);
    expect(scorecard.attempted).toBe(0);
    expect(scorecard.unattempted).toBe(3);
    expect(scorecard.correct).toBe(0);
    expect(scorecard.incorrect).toBe(0);
    expect(scorecard.totalMarks).toBe(0);
    expect(scorecard.accuracyPercent).toBe(0);
  });
});

