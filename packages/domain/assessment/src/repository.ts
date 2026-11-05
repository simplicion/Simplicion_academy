import { Question, Scorecard } from './index';

export interface IAssessmentRepository {
  findQuestionsByUnit(tenantId: string, unitId: string): Promise<Question[]>;
  findQuestionById(tenantId: string, questionId: string): Promise<Question | null>;
  saveQuestion(question: Question): Promise<void>;
  saveScorecard(scorecard: Scorecard): Promise<void>;
  getScorecard(studentId: string, testId: string): Promise<Scorecard | null>;
}

