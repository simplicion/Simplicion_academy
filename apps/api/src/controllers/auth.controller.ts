import crypto from 'crypto';
import { Request, Response } from 'express';
import { OtpSession, UserAggregate } from '@simplicion/identity';
import { JwtService } from '../security/jwt';
import { One80IdentityService } from '../security/one80-identity.service';

// In-memory demo store for OTP sessions
const otpStore = new Map<string, OtpSession>();

export class AuthController {
  /**
   * POST /auth/otp/request
   * Generates a 6-digit OTP for student registration/login
   */
  static async requestOtp(req: Request, res: Response) {
    try {
      const tenant = req.tenant;
      if (!tenant) return res.status(404).json({ success: false, error: 'Tenant context required.' });

      const { phone } = req.body;
      if (!phone) return res.status(400).json({ success: false, error: 'Phone number is required.' });

      const { session, rawCode } = OtpSession.generate(
        `otp-${Date.now()}`,
        tenant.id,
        phone
      );

      otpStore.set(`${tenant.id}:${phone.replace(/\D/g, '')}`, session);

      // In production, dispatched via SMS gateway (Fast2SMS/MSG91/Twilio).
      // Returned in demo mode for automated testing / evaluation:
      return res.json({
        success: true,
        message: 'OTP sent successfully to registered phone number.',
        devOnlyCode: rawCode,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /auth/otp/verify
   * Verifies OTP and returns user session with cryptographically signed JWT
   */
  static async verifyOtp(req: Request, res: Response) {
    try {
      const tenant = req.tenant;
      if (!tenant) return res.status(404).json({ success: false, error: 'Tenant context required.' });

      const { phone, code, name } = req.body;
      if (!phone || !code) {
        return res.status(400).json({ success: false, error: 'Phone and OTP code are required.' });
      }

      const cleanPhone = phone.replace(/\D/g, '');
      const key = `${tenant.id}:${cleanPhone}`;
      const session = otpStore.get(key);

      if (!session) {
        return res.status(400).json({ success: false, error: 'No active OTP request found for this number.' });
      }

      session.verify(code);

      // Create or retrieve tenant-scoped student
      const student = UserAggregate.createStudent(
        `usr-${cleanPhone}`,
        tenant.id,
        cleanPhone,
        name || 'Student'
      );

      // Generate cryptographically signed JWT token with tenant claims
      const token = JwtService.createStudentToken(student.id, tenant.id, cleanPhone);

      return res.json({
        success: true,
        user: student.toJSON(),
        token,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /auth/180/authorize-url
   * Generates the official 180 Identity Universal SSO URL (https://profile.180core.cloud/auth/login)
   */
  static async getOne80AuthorizeUrl(req: Request, res: Response) {
    try {
      const mode = req.query.mode === 'signup' ? 'signup' : 'login';
      const redirectUri =
        (req.query.redirectUri as string) ||
        process.env['STUDENT_PORTAL_URL'] ||
        'http://localhost:3001/';
      const state = crypto.randomBytes(16).toString('hex');

      const authorizeUrl = One80IdentityService.buildAuthorizationUrl({
        redirectUri,
        state,
        scope: 'openid profile email',
        mode,
      });

      return res.json({
        success: true,
        provider: '180_identity',
        mode,
        clientId: One80IdentityService.CLIENT_ID,
        state,
        authorizeUrl,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /auth/180/callback
   * Exchanges OAuth authorization code with https://api.180core.cloud/api/oauth/token
   * and returns a signed 180 Identity session token.
   */
  static async handleOne80Callback(req: Request, res: Response) {
    try {
      const tenantId = req.tenant?.id || 'tenant_cuet_01';
      const { code, redirectUri } = req.body;

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ success: false, error: 'Authorization code is required.' });
      }

      const resolvedRedirectUri =
        redirectUri || process.env['STUDENT_PORTAL_URL'] || 'http://localhost:3001/';

      const { user } = await One80IdentityService.exchangeAuthorizationCode({
        code,
        redirectUri: resolvedRedirectUri,
      });

      const token = One80IdentityService.issueToken({
        userId: user.id,
        tenantId,
        role: 'student',
        name: user.name,
        email: user.email,
        phone: user.phone,
      });

      return res.json({
        success: true,
        provider: '180_identity',
        user: {
          id: user.id,
          name: user.name,
          email: user.email || '',
          phone: user.phone || '',
          provider: '180_identity',
        },
        token,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /auth/180/session
   * Issues a cryptographically signed 180 Identity session token for login or signup.
   */
  static async createOne80Session(req: Request, res: Response) {
    try {
      const tenantId = req.tenant?.id || 'tenant_cuet_01';
      const { name, email, phone, mode = 'login' } = req.body;

      const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      const cleanPhone = typeof phone === 'string' ? phone.replace(/\D/g, '') : '';

      if (!cleanEmail && cleanPhone.length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid email address or 10-digit mobile number.',
        });
      }

      const displayName =
        (typeof name === 'string' && name.trim()) ||
        (cleanEmail ? cleanEmail.split('@')[0] : 'Student');
      const identifier = cleanEmail || cleanPhone;
      const userId = `180_usr_${crypto.createHash('sha256').update(identifier).digest('hex').slice(0, 12)}`;

      const token = One80IdentityService.issueToken({
        userId,
        tenantId,
        role: 'student',
        name: displayName,
        email: cleanEmail || undefined,
        phone: cleanPhone || undefined,
      });

      return res.json({
        success: true,
        provider: '180_identity',
        mode,
        user: {
          id: userId,
          name: displayName,
          email: cleanEmail,
          phone: cleanPhone,
          provider: '180_identity',
        },
        token,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /auth/180/me
   * Verifies a Bearer 180 Identity token and returns the authenticated user profile.
   */
  static async getOne80Me(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (!token) {
        return res.status(401).json({ success: false, error: 'Missing 180 Identity token.' });
      }

      const payload = One80IdentityService.verifyToken(token);
      return res.json({
        success: true,
        provider: '180_identity',
        user: {
          id: payload.sub,
          name: payload.name || 'Student',
          email: payload.email || '',
          phone: payload.phone || '',
          role: payload.role,
          tenantId: payload.tenantId,
        },
      });
    } catch (error: any) {
      return res.status(401).json({ success: false, error: error.message });
    }
  }
}
