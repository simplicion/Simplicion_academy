import { IAssessmentRepository, Question, Scorecard } from '@simplicion/assessment';
import { enforceTenantScope } from '../index';

export class PrismaAssessmentRepository implements IAssessmentRepository {
  private questionsStore = new Map<string, Question>();
  private scorecardsStore = new Map<string, Scorecard>();

  constructor(initialQuestions: Question[] = []) {
    initialQuestions.forEach((q) => {
      this.questionsStore.set(q.id, q);
    });
  }

  async findQuestionsByUnit(tenantId: string, unitId: string): Promise<Question[]> {
    const list: Question[] = [];
    for (const q of this.questionsStore.values()) {
      if (q.tenantId === tenantId && q.unitId === unitId) {
        list.push({ ...q });
      }
    }
    return list;
  }

  async findQuestionById(tenantId: string, questionId: string): Promise<Question | null> {
    const q = this.questionsStore.get(questionId);
    if (!q) return null;

    enforceTenantScope({ tenantId: q.tenantId }, { tenantId });
    return { ...q };
  }

  async saveQuestion(question: Question): Promise<void> {
    this.questionsStore.set(question.id, { ...question });
  }

  async saveScorecard(scorecard: Scorecard): Promise<void> {
    const key = `${scorecard.studentId}_${scorecard.testId}`;
    this.scorecardsStore.set(key, { ...scorecard });
  }

  async getScorecard(studentId: string, testId: string): Promise<Scorecard | null> {
    const key = `${studentId}_${testId}`;
    const data = this.scorecardsStore.get(key);
    return data ? { ...data } : null;
  }
}

