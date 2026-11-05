/**
 * @simplicion/domain-assessment
 * Conforms to SAFS-00, SAFS-01, SAFS-02 & PRD FR-ASSESS (CBT Engine)
 */

export interface Question {
  id: string;
  sectionId?: string;
  type: 'single_choice' | 'multiple_choice' | 'numeric' | 'true_false';
  textEn: string;
  textHi?: string;
  options: { id: string; textEn: string; textHi?: string }[];
  correctOptionIds: string[];
  explanationEn?: string;
  explanationHi?: string;
  marks: number;
  negativeMarks: number;
}

export interface UserAnswer {
  questionId: string;
  selectedOptionIds: string[];
  timeSpentSeconds: number;
  isMarkedForReview: boolean;
}

export interface Scorecard {
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  totalMarksScored: number;
  maxPossibleMarks: number;
  accuracyPercent: number;
  percentageScore: number;
}

export interface AttemptProps {
  id: string;
  tenantId: string;
  testId: string;
  userId: string;
  durationMinutes: number;
  startedAt: Date;
  submittedAt?: Date;
  status: 'in_progress' | 'submitted' | 'timed_out';
  answers: Map<string, UserAnswer>;
  scorecard?: Scorecard;
}

export class AttemptAggregate {
  private props: AttemptProps;

  constructor(props: AttemptProps) {
    this.props = props;
  }

  public static start(
    id: string,
    tenantId: string,
    testId: string,
    userId: string,
    durationMinutes: number
  ): AttemptAggregate {
    return new AttemptAggregate({
      id,
      tenantId,
      testId,
      userId,
      durationMinutes,
      startedAt: new Date(),
      status: 'in_progress',
      answers: new Map(),
    });
  }

  public recordAnswer(answer: UserAnswer): void {
    if (this.props.status !== 'in_progress') {
      throw new Error(`Cannot record answer on an attempt that is already ${this.props.status}.`);
    }
    this.props.answers.set(answer.questionId, answer);
  }

  public isTimeExpired(): boolean {
    const elapsedMinutes = (Date.now() - this.props.startedAt.getTime()) / (1000 * 60);
    return elapsedMinutes >= this.props.durationMinutes;
  }

  public submit(questions: Question[]): Scorecard {
    if (this.props.status !== 'in_progress') {
      throw new Error(`Attempt has already been finalized as ${this.props.status}.`);
    }

    const timedOut = this.isTimeExpired();
    this.props.status = timedOut ? 'timed_out' : 'submitted';
    this.props.submittedAt = new Date();

    const scorecard = this.calculateScore(questions);
    this.props.scorecard = scorecard;
    return scorecard;
  }

  public calculateScore(questions: Question[]): Scorecard {
    let attempted = 0;
    let correct = 0;
    let incorrect = 0;
    let totalMarksScored = 0;
    let maxPossibleMarks = 0;

    for (const q of questions) {
      maxPossibleMarks += q.marks;
      const userAns = this.props.answers.get(q.id);

      if (!userAns || userAns.selectedOptionIds.length === 0) {
        continue;
      }

      attempted++;
      const isCorrect =
        q.correctOptionIds.length === userAns.selectedOptionIds.length &&
        q.correctOptionIds.every((id) => userAns.selectedOptionIds.includes(id));

      if (isCorrect) {
        correct++;
        totalMarksScored += q.marks;
      } else {
        incorrect++;
        totalMarksScored -= q.negativeMarks;
      }
    }

    const unattempted = questions.length - attempted;
    const accuracyPercent = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const percentageScore =
      maxPossibleMarks > 0 ? Math.round((Math.max(0, totalMarksScored) / maxPossibleMarks) * 100) : 0;

    return {
      totalQuestions: questions.length,
      attempted,
      correct,
      incorrect,
      unattempted,
      totalMarksScored: Math.max(0, totalMarksScored),
      maxPossibleMarks,
      accuracyPercent,
      percentageScore,
    };
  }

  // Getters
  public get id(): string { return this.props.id; }
  public get tenantId(): string { return this.props.tenantId; }
  public get status(): AttemptProps['status'] { return this.props.status; }
  public get scorecard(): Scorecard | undefined { return this.props.scorecard; }
  public get answers(): ReadonlyMap<string, UserAnswer> { return this.props.answers; }
}

export * from './repository';

