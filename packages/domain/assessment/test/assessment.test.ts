import { describe, it, expect } from 'vitest';
import { AttemptAggregate, Question } from '../src';

describe('@simplicion/domain-assessment CBT Engine Invariants', () => {
  const testQuestions: Question[] = [
    {
      id: 'q1',
      type: 'single_choice',
      textEn: 'Question 1',
      options: [{ id: 'optA', textEn: 'A' }, { id: 'optB', textEn: 'B' }],
      correctOptionIds: ['optA'],
      marks: 4,
      negativeMarks: 1,
    },
    {
      id: 'q2',
      type: 'single_choice',
      textEn: 'Question 2',
      options: [{ id: 'optA', textEn: 'A' }, { id: 'optB', textEn: 'B' }],
      correctOptionIds: ['optB'],
      marks: 4,
      negativeMarks: 1,
    },
    {
      id: 'q3',
      type: 'single_choice',
      textEn: 'Question 3',
      options: [{ id: 'optA', textEn: 'A' }, { id: 'optB', textEn: 'B' }],
      correctOptionIds: ['optA'],
      marks: 4,
      negativeMarks: 1,
    },
  ];

  it('should calculate correct CBT scorecard with negative marking', () => {
    const attempt = AttemptAggregate.start('att-01', 'tenant-01', 'test-01', 'user-01', 60);

    // Q1: Correct (optA) -> +4 marks
    attempt.recordAnswer({
      questionId: 'q1',
      selectedOptionIds: ['optA'],
      timeSpentSeconds: 45,
      isMarkedForReview: false,
    });

    // Q2: Incorrect (selected optA instead of optB) -> -1 mark
    attempt.recordAnswer({
      questionId: 'q2',
      selectedOptionIds: ['optA'],
      timeSpentSeconds: 30,
      isMarkedForReview: false,
    });

    // Q3: Unattempted -> 0 marks

    const scorecard = attempt.submit(testQuestions);

    expect(scorecard.totalQuestions).toBe(3);
    expect(scorecard.attempted).toBe(2);
    expect(scorecard.correct).toBe(1);
    expect(scorecard.incorrect).toBe(1);
    expect(scorecard.unattempted).toBe(1);
    expect(scorecard.totalMarksScored).toBe(3); // 4 - 1 = 3
    expect(scorecard.maxPossibleMarks).toBe(12); // 3 * 4 = 12
    expect(scorecard.accuracyPercent).toBe(50); // 1 out of 2 attempted
  });
});

