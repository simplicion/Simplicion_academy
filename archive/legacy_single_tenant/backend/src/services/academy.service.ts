import { prisma } from '@pitchin180/db';

export interface CreateCourseDTO {
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  category?: string;
  level?: string;
  instructorName?: string;
  instructorRole?: string;
  estimatedMinutes?: number;
  tags?: string[];
}

export class AcademyService {
  /**
   * Fetch all learning paths with their included courses
   */
  static async getLearningPaths() {
    return prisma.learningPath.findMany({
      where: { isPublished: true },
      include: {
        courses: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            level: true,
            estimatedMinutes: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Fetch catalog of courses with optional category filtering
   */
  static async getCourses(category?: string) {
    return prisma.course.findMany({
      where: {
        isPublished: true,
        ...(category ? { category } : {}),
      },
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                durationMinutes: true,
                isFreePreview: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Fetch detailed course by slug including modules, lessons, and competencies
   */
  static async getCourseBySlug(slug: string, userId?: string) {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
        competencies: true,
        certificates: true,
      },
    });

    if (!course) return null;

    let userEnrollment = null;
    if (userId) {
      userEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
      });
    }

    return {
      ...course,
      userEnrollment,
    };
  }

  /**
   * Enroll a user into a course
   */
  static async enrollUser(userId: string, courseId: string) {
    return prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      update: {
        status: 'in_progress',
      },
      create: {
        userId,
        courseId,
        progress: 0,
        status: 'in_progress',
      },
    });
  }

  /**
   * Mark a lesson as completed and recalculate course progress
   */
  static async completeLesson(userId: string, lessonId: string) {
    // 1. Record lesson progress
    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        isCompleted: true,
      },
    });

    // 2. Fetch lesson to find parent course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) return lessonProgress;

    const course = lesson.module.course;
    const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);

    if (totalLessons === 0) return lessonProgress;

    // 3. Count user's completed lessons in this course
    const allLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));
    const completedCount = await prisma.lessonProgress.count({
      where: {
        userId,
        lessonId: { in: allLessonIds },
        isCompleted: true,
      },
    });

    const progressPercentage = Math.round((completedCount / totalLessons) * 100);
    const isCompleted = progressPercentage >= 100;

    // 4. Update enrollment
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId, courseId: course.id },
      },
      update: {
        progress: progressPercentage,
        status: isCompleted ? 'completed' : 'in_progress',
        completedAt: isCompleted ? new Date() : undefined,
      },
      create: {
        userId,
        courseId: course.id,
        progress: progressPercentage,
        status: isCompleted ? 'completed' : 'in_progress',
        completedAt: isCompleted ? new Date() : undefined,
      },
    });

    // 5. If completed, issue certificate if course has one
    if (isCompleted) {
      const certificateTemplate = await prisma.certificate.findFirst({
        where: { courseId: course.id },
      });

      if (certificateTemplate) {
        await prisma.userCertificate.upsert({
          where: {
            certificateNo: `CERT-${userId.slice(0, 4)}-${course.id.slice(0, 4)}`,
          },
          update: {},
          create: {
            userId,
            certificateId: certificateTemplate.id,
            certificateNo: `CERT-${userId.slice(0, 4)}-${course.id.slice(0, 4)}`,
          },
        });
      }
    }

    return {
      lessonProgress,
      courseProgress: progressPercentage,
      isCompleted,
    };
  }

  /**
   * Fetch user's enrolled courses with progress
   */
  static async getUserEnrollments(userId: string) {
    return prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            thumbnailUrl: true,
            estimatedMinutes: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Fetch user certificates
   */
  static async getUserCertificates(userId: string) {
    return prisma.userCertificate.findMany({
      where: { userId },
      include: {
        certificate: {
          include: {
            course: true,
          },
        },
      },
    });
  }
}
