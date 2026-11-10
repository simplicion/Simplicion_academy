import express from 'express';
import cors from 'cors';
import { tenantResolutionMiddleware } from './middleware/tenant-resolution';
import { TenantController } from './controllers/tenant.controller';
import { CatalogController } from './controllers/catalog.controller';
import { AuthController } from './controllers/auth.controller';
import { AssessmentController } from './controllers/assessment.controller';
import { CommerceController } from './controllers/commerce.controller';
import { RazorpayWebhookController } from './controllers/razorpay-webhook.controller';
import { UploadController } from './controllers/upload.controller';
import { validateBody, validateRequestOtp, validateVerifyOtp, validateCreateOrder } from './validation';
import { otpRequestLimiter } from './middleware/rate-limiter';
import { authenticateJwt } from './security/jwt';

export function createApiApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Universal Tenant Resolution Middleware
  app.use(tenantResolutionMiddleware());

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      tenant: req.tenant || null,
    });
  });

  // Public Tenant Endpoints
  app.get('/site-config', TenantController.getSiteConfig);
  app.get('/offerings', CatalogController.getOfferings);

  // Authentication Endpoints (Guarded by Rate Limiting and Zod/Type Validation)
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

  // CBT Assessment Endpoints
  app.post('/tests/:id/start', AssessmentController.startTest);
  app.post('/attempts/:id/submit', AssessmentController.submitAttempt);

  // Commerce & Webhook Endpoints
  app.post(
    '/checkout/order',
    validateBody(validateCreateOrder),
    CommerceController.createOrder
  );
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
  (typeof process !== 'undefined' && process.argv[1] && (process.argv[1].replace(/\\/g, '/').endsWith('src/index.ts') || process.argv[1].replace(/\\/g, '/').endsWith('index.ts')));

if (isDirectExecution) {
  const port = process.env.PORT || 4000;
  const app = createApiApp();
  app.listen(port, () => {
    console.log(`[Simplicion API Gateway] Running on http://localhost:${port}`);
  });
}
export { authenticateJwt };
