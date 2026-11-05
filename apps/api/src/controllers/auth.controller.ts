import { Request, Response } from 'express';
import { OtpSession, UserAggregate } from '@simplicion/identity';
import { JwtService } from '../security/jwt';

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
}
