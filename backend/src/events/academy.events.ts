export interface DomainEvent<T = any> {
  eventName: string;
  timestamp: Date;
  payload: T;
}

export interface CourseCompletedPayload {
  userId: string;
  courseId: string;
  courseTitle: string;
  certificateNo?: string;
  earnedSkills: string[];
}

export interface BadgeEarnedPayload {
  userId: string;
  badgeName: string;
  badgeImageUrl: string;
}

export class AcademyEvents {
  static createCourseCompletedEvent(payload: CourseCompletedPayload): DomainEvent<CourseCompletedPayload> {
    return {
      eventName: 'Academy.CourseCompleted',
      timestamp: new Date(),
      payload,
    };
  }

  static createBadgeEarnedEvent(payload: BadgeEarnedPayload): DomainEvent<BadgeEarnedPayload> {
    return {
      eventName: 'Academy.BadgeEarned',
      timestamp: new Date(),
      payload,
    };
  }
}
