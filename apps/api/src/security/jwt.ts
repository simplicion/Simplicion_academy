import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export interface JwtPayload {
  sub: string; // User ID / Admin ID
  tenantId: string;
  role: 'student' | 'teacher' | 'superadmin';
  phone?: string;
  email?: string;
  impersonated?: boolean;
  ticketId?: string;
  reason?: string;
  iat: number;
  exp: number;
}

export class JwtService {
  private static DEFAULT_SECRET = process.env.JWT_SECRET || 'jwt_simplicion_enterprise_secret_2026';

  private static base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  private static base64UrlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    return Buffer.from(str, 'base64').toString('utf8');
  }

  /**
   * RFC 7519 HMAC SHA256 Token Signing
   */
  public static sign(
    payload: Omit<JwtPayload, 'iat' | 'exp'>,
    expiresInSeconds: number,
    secret?: string
  ): string {
    const key = secret || JwtService.DEFAULT_SECRET;
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
    };

    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = JwtService.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = JwtService.base64UrlEncode(JSON.stringify(fullPayload));

    const signature = crypto
      .createHmac('sha256', key)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * RFC 7519 Token Verification with timing-safe signature comparison
   */
  public static verify(token: string, secret?: string): JwtPayload {
    const key = secret || JwtService.DEFAULT_SECRET;
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Malformed JWT token.');
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', key)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new Error('Invalid JWT signature.');
    }

    const payloadJson = JwtService.base64UrlDecode(encodedPayload);
    const payload: JwtPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('JWT token has expired.');
    }

    return payload;
  }

  /**
   * Presets for standard application roles
   */
  public static createStudentToken(userId: string, tenantId: string, phone: string): string {
    return JwtService.sign(
      { sub: userId, tenantId, phone, role: 'student' },
      7 * 24 * 60 * 60 // 7 Days TTL
    );
  }

  public static createTeacherToken(teacherId: string, tenantId: string, email: string): string {
    return JwtService.sign(
      { sub: teacherId, tenantId, email, role: 'teacher' },
      24 * 60 * 60 // 24 Hours TTL
    );
  }

  public static createImpersonationToken(
    adminId: string,
    tenantId: string,
    ticketId?: string,
    reason?: string
  ): string {
    return JwtService.sign(
      {
        sub: adminId,
        tenantId,
        role: 'superadmin',
        impersonated: true,
        ticketId,
        reason,
      },
      15 * 60 // 15 Minutes TTL (SAFS-02)
    );
  }
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export interface AuthMiddlewareOptions {
  requiredRole?: 'student' | 'teacher' | 'superadmin';
  allowImpersonation?: boolean;
}

/**
 * Express Middleware verifying JWT & enforcing tenant claim matching
 */
export function authenticateJwt(options: AuthMiddlewareOptions = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or malformed Authorization header. Expected Bearer token.',
      });
    }

    const token = authHeader.substring(7);

    try {
      const payload = JwtService.verify(token);
      req.user = payload;

      // Role Check
      if (options.requiredRole && payload.role !== options.requiredRole) {
        // Super admin impersonation override if allowed
        if (options.allowImpersonation && payload.role === 'superadmin' && payload.impersonated) {
          // allowed
        } else {
          return res.status(403).json({
            success: false,
            error: `Forbidden: Endpoint requires role "${options.requiredRole}".`,
          });
        }
      }

      // SAFS-02 Multi-Tenant Invariant: Token tenantId MUST match request tenant context
      if (req.tenant && payload.tenantId !== req.tenant.id && payload.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          error: `Cross-Tenant Security Violation: Token tenantId "${payload.tenantId}" does not match active host tenant "${req.tenant.id}".`,
        });
      }

      next();
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: error.message || 'Unauthorized: Token verification failed.',
      });
    }
  };
}

