import express from 'express';
import cors from 'cors';
import { tenantResolutionMiddleware } from './middleware/tenant-resolution';
import { TenantController } from './controllers/tenant.controller';
import { CatalogController } from './controllers/catalog.controller';
import { AuthController } from './controllers/auth.controller';
import { AssessmentController } from './controllers/assessment.controller';
import { CommerceController } from './controllers/commerce.controller';
import { RazorpayWebhookController } from './controllers/razorpay-webhook.controller';
import { One80PayController } from './controllers/one80-pay.controller';
import { UploadController } from './controllers/upload.controller';
import { LeadController } from './controllers/lead.controller';
import { CourseController } from './controllers/course.controller';
import { CourseTestController } from './controllers/course-test.controller';
import { validateBody, validateRequestOtp, validateVerifyOtp, validateCreateOrder } from './validation';
import { otpRequestLimiter } from './middleware/rate-limiter';
import { authenticateJwt } from './security/jwt';
import {
  bootstrapSupabaseDatabase,
  isSupabaseDbEnabled,
  SUPABASE_STORAGE_BUCKET,
  SUPABASE_URL,
} from './lib/supabase';
import { getCachedStorefrontData } from './lib/storefront-cache';
import {
  apiResponseCacheMiddleware,
  gzipJsonMiddleware,
  setApiCachePort,
  warmHotCaches,
} from './lib/api-cache';

export function createApiApp(): express.Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Universal Tenant Resolution Middleware
  app.use(tenantResolutionMiddleware());

  // Global Gzip Compression + SWR Read-Through Cache, Singleflight Coalescing & Auto-Invalidation
  // (Order matters: gzipJsonMiddleware runs first, then apiResponseCacheMiddleware wraps res.json)
  app.use(gzipJsonMiddleware);
  app.use(apiResponseCacheMiddleware);

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      tenant: req.tenant || null,
      supabase: {
        url: SUPABASE_URL,
        dbEnabled: isSupabaseDbEnabled(),
        storageBucket: SUPABASE_STORAGE_BUCKET,
      },
    });
  });

  // Discovery & Instant Self-Serve Teacher Onboarding (Zero-Approval)
  app.get('/tenants/search', TenantController.searchTenants);
  app.post('/tenants/onboard-instant', TenantController.onboardInstant);

  // Public Tenant Endpoints (Backed by Supabase PostgreSQL + Realtime + Sub-5ms Edge Cache)
  app.get('/public/storefront', async (req, res) => {
    const started = performance.now();
    try {
      const slug = ((req.query.tenant as string) || req.tenant?.slug || 'cuet-humanities').toLowerCase();
      const { cacheStatus, payload } = await getCachedStorefrontData(slug);
      const elapsedMs = Math.round((performance.now() - started) * 100) / 100;
      res.setHeader('X-Cache', cacheStatus);
      res.setHeader('X-Response-Time-Ms', String(elapsedMs));
      res.setHeader('Cache-Control', 'public, max-age=5, stale-while-revalidate=60');
      return res.json(payload);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Storefront error' });
    }
  });
  app.get('/site-config', TenantController.getSiteConfig);
  app.put('/site-config', TenantController.updateSiteConfig);
  app.patch('/site-config/portal-status', TenantController.updatePortalStatus);
  app.get('/offerings', CatalogController.getOfferings);

  // Waitlist & Launch Notification Leads (Backed by Supabase PostgreSQL)
  app.post('/leads', LeadController.createLead);
  app.get('/leads', LeadController.listLeads);

  // Academy-Wide Live Overview, Live Classes Hub, Global Doubts Inbox & Global Student Roster (Supabase)
  app.get('/academy/overview', CourseController.getAcademyOverview);
  app.get('/academy/live-sessions', CourseController.listAcademyLiveSessions);
  app.get('/academy/doubts', CourseController.listAcademyDoubts);
  app.get('/academy/students', CourseController.listAcademyStudents);

  // Dedicated Course Workspace, Subjects -> Lessons -> Topics, Go Live, Chat, Doubts & Notifications (Supabase)
  app.get('/courses', CourseController.listCourses);
  app.post('/courses', CourseController.createCourse);
  app.get('/courses/:id', CourseController.getCourseDashboard);
  app.get('/courses/:id/metrics', CourseController.getCourseDashboard);
  app.patch('/courses/:id/setup', CourseController.completeCourseSetup);
  app.patch('/courses/:id/featured', CourseController.toggleFeaturedCourse);
  app.post('/courses/:id/publish', CourseController.publishCourse);
  app.post('/courses/:id/unpublish', CourseController.unpublishCourse);
  app.delete('/courses/:id', CourseController.deleteCourse);
  app.get('/courses/:id/curriculum', CourseController.getCurriculum);
  app.post('/courses/:id/subjects', CourseController.createSubject);
  app.patch('/courses/:id/subjects/reorder', CourseController.reorderSubjects);
  app.patch('/subjects/:subjectId', CourseController.updateSubject);
  app.delete('/subjects/:subjectId', CourseController.deleteSubject);
  app.post('/subjects/:subjectId/lessons', CourseController.createLesson);
  app.patch('/subjects/:subjectId/lessons/reorder', CourseController.reorderLessons);
  app.patch('/lessons/:lessonId', CourseController.updateLesson);
  app.post('/lessons/:lessonId/duplicate', CourseController.duplicateLesson);
  app.delete('/lessons/:lessonId', CourseController.deleteLesson);
  app.post('/lessons/:lessonId/topics', CourseController.createTopic);
  app.patch('/lessons/:lessonId/topics/reorder', CourseController.reorderTopics);
  app.post('/topics/:topicId/duplicate', CourseController.duplicateTopic);
  app.put('/topics/:topicId', CourseController.updateTopic);
  app.delete('/topics/:topicId', CourseController.deleteTopic);
  app.post('/courses/:id/live-sessions', CourseController.createLiveSession);
  app.patch('/live-sessions/:sessionId/status', CourseController.updateLiveSessionStatus);
  app.post('/live-sessions/:sessionId/join', CourseController.recordLiveSessionJoin);
  app.delete('/live-sessions/:sessionId', CourseController.deleteLiveSession);
  app.post('/courses/:id/enroll', CourseController.enrollStudent);
  app.post('/courses/:id/waitlist', CourseController.joinWaitlist);
  app.get('/student/enrollments', CourseController.listStudentEnrollments);
  app.get('/courses/:id/progress', CourseController.getStudentProgress);
  app.post('/courses/:id/topics/:topicId/complete', CourseController.toggleTopicCompletion);
  app.get('/courses/:id/chat', CourseController.listChatMessages);
  app.post('/courses/:id/chat', CourseController.postChatMessage);
  app.patch('/courses/:id/chat/:messageId/pin', CourseController.togglePinChatMessage);
  app.patch('/courses/:id/chat-settings', CourseController.updateChatSettings);
  app.get('/courses/:id/doubts', CourseController.listDoubts);
  app.post('/courses/:id/doubts', CourseController.createDoubt);
  app.post('/courses/:id/doubts/:doubtId/reply', CourseController.replyToDoubt);
  app.patch('/courses/:id/doubts/:doubtId/pin-faq', CourseController.togglePinFaq);
  app.get('/notifications', CourseController.listNotifications);
  app.patch('/notifications/:notificationId/read', CourseController.markNotificationRead);
  app.post('/notifications/read-all', CourseController.markAllNotificationsRead);

  // Course-Linked Tests & Flexible Assessments (Lesson / Subject / Full Course)
  app.get('/courses/:id/tests', CourseTestController.listCourseTests);
  app.post('/courses/:id/tests', CourseTestController.createCourseTest);
  app.get('/course-tests/:testId', CourseTestController.getCourseTestDetail);
  app.patch('/course-tests/:testId', CourseTestController.updateCourseTest);
  app.delete('/course-tests/:testId', CourseTestController.deleteCourseTest);
  app.post('/course-tests/:testId/questions', CourseTestController.addQuestion);
  app.put('/course-tests/:testId/questions/:questionId', CourseTestController.updateQuestion);
  app.delete('/course-tests/:testId/questions/:questionId', CourseTestController.deleteQuestion);
  app.post('/course-tests/:testId/submit', CourseTestController.submitCourseTest);

  // Authentication Endpoints — 180 Identity (https://developer.180core.cloud/docs?section=overview)
  app.get('/auth/180/authorize-url', AuthController.getOne80AuthorizeUrl);
  app.post('/auth/180/callback', AuthController.handleOne80Callback);
  app.post('/auth/180/session', AuthController.createOne80Session);
  app.get('/auth/180/me', AuthController.getOne80Me);

  // Legacy / Rate-limited OTP Endpoints
  app.post(
    '/auth/otp/request',
    otpRequestLimiter.middleware(),
    validateBody(validateRequestOtp),
    AuthController.requestOtp
  );
  app.post(
    '/auth/otp/verify',
    validateBody(validateVerifyOtp),
    AuthController.verifyOtp
  );

  // CBT Assessment & Flexible Question Bank Endpoints (Supabase Backed)
  app.get('/cbt/questions', AssessmentController.listQuestions);
  app.post('/cbt/questions', AssessmentController.createQuestion);
  app.put('/cbt/questions/:id', AssessmentController.updateQuestion);
  app.delete('/cbt/questions/:id', AssessmentController.deleteQuestion);
  app.post('/cbt/submit', AssessmentController.submitLiveTest);
  app.post('/tests/:id/start', AssessmentController.startTest);
  app.post('/attempts/:id/submit', AssessmentController.submitAttempt);

  // Commerce & Webhook Endpoints (180 Pay primary + Razorpay fallback)
  app.post(
    '/checkout/order',
    validateBody(validateCreateOrder),
    CommerceController.createOrder
  );
  app.post('/pay/180/checkout-session', One80PayController.createCheckoutSession);
  app.post('/pay/180/create-order', One80PayController.createOrder);
  app.post('/pay/180/subscribe-teacher', One80PayController.subscribeTeacher);
  app.get('/subscription/status', One80PayController.getSubscriptionStatus);
  app.post('/subscription/deactivate', One80PayController.deactivateSubscription);
  app.post('/pay/180/payouts/request', One80PayController.requestPayout);
  app.get('/pay/180/payouts', One80PayController.getPayouts);
  app.post('/webhooks/180-pay', One80PayController.handleWebhook);
  app.post('/webhooks/payment', CommerceController.handlePaymentWebhook);
  app.post('/webhooks/razorpay', RazorpayWebhookController.handleWebhook);

  // Media & Cloud Storage Presigned Uploads (Guarded by Teacher/SuperAdmin Auth)
  app.post(
    '/uploads/presigned-url',
    authenticateJwt({ requiredRole: 'teacher', allowImpersonation: true }),
    UploadController.getPresignedUploadUrl
  );

  return app;
}

const isDirectExecution =
  (typeof require !== 'undefined' && require.main === module) ||
  (typeof process !== 'undefined' &&
    process.argv[1] &&
    (process.argv[1].replace(/\\/g, '/').endsWith('src/index.ts') ||
      process.argv[1].replace(/\\/g, '/').endsWith('index.ts')));

if (isDirectExecution) {
  const port = Number(process.env.PORT || 4000);
  setApiCachePort(port);
  const app = createApiApp();
  app.listen(port, () => {
    console.log(`[Simplicion API Gateway] Running on http://localhost:${port}`);
    bootstrapSupabaseDatabase()
      .then(() => warmHotCaches(port))
      .catch(() => {});
  });
}
export { authenticateJwt };
