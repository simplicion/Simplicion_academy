import { AcademyService } from '../services/academy.service';

export class AcademyController {
  static async getLearningPaths(req: any, res: any) {
    try {
      const paths = await AcademyService.getLearningPaths();
      return res.json({ success: true, data: paths });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getCourses(req: any, res: any) {
    try {
      const category = req.query.category as string | undefined;
      const courses = await AcademyService.getCourses(category);
      return res.json({ success: true, data: courses });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getCourseBySlug(req: any, res: any) {
    try {
      const { slug } = req.params;
      const userId = req.user?.id;
      const course = await AcademyService.getCourseBySlug(slug, userId);
      
      if (!course) {
        return res.status(404).json({ success: false, error: 'Course not found' });
      }

      return res.json({ success: true, data: course });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async enroll(req: any, res: any) {
    try {
      const userId = req.user?.id || req.body.userId;
      const { courseId } = req.body;

      if (!userId || !courseId) {
        return res.status(400).json({ success: false, error: 'userId and courseId are required' });
      }

      const enrollment = await AcademyService.enrollUser(userId, courseId);
      return res.json({ success: true, data: enrollment });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async completeLesson(req: any, res: any) {
    try {
      const userId = req.user?.id || req.body.userId;
      const { lessonId } = req.params;

      if (!userId || !lessonId) {
        return res.status(400).json({ success: false, error: 'userId and lessonId are required' });
      }

      const result = await AcademyService.completeLesson(userId, lessonId);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getUserEnrollments(req: any, res: any) {
    try {
      const userId = req.user?.id || req.params.userId;
      if (!userId) {
        return res.status(400).json({ success: false, error: 'userId is required' });
      }

      const enrollments = await AcademyService.getUserEnrollments(userId);
      return res.json({ success: true, data: enrollments });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getUserCertificates(req: any, res: any) {
    try {
      const userId = req.user?.id || req.params.userId;
      if (!userId) {
        return res.status(400).json({ success: false, error: 'userId is required' });
      }

      const certificates = await AcademyService.getUserCertificates(userId);
      return res.json({ success: true, data: certificates });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
