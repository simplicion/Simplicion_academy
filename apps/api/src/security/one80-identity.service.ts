import crypto from 'crypto';

export interface One80TokenPayload {
  sub: string;
  tenantId: string;
  role: 'teacher' | 'student' | 'admin';
  name?: string;
  email?: string;
  phone?: string;
  issuer: '180_identity';
  iat: number;
  exp: number;
}

export class One80IdentityService {
  public static readonly CLIENT_ID =
    process.env['180_CLIENT_ID'] || '180_client_3f697aec4c406a407979d708780106f0';
  public static readonly CLIENT_SECRET =
    process.env['180_CLIENT_SECRET'] ||
    '180_secret_50e7b13eb02eb99f90cbc8a276ca1fbe9d42b13ac8c485d4823089776b2f7ad9';
  public static readonly WEBHOOK_SECRET =
    process.env['180_WEBHOOK_SECRET'] || 'whsec_ba609675e3da1dcf164914fcfc410f53e8deab8e9756884d';

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
   * Generates a cryptographically signed 180 Identity session token
   */
  public static issueToken(
    params: {
      userId: string;
      tenantId: string;
      role: 'teacher' | 'student' | 'admin';
      name?: string;
      email?: string;
      phone?: string;
    },
    expiresInSeconds: number = 7 * 24 * 60 * 60
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: One80TokenPayload = {
      sub: params.userId,
      tenantId: params.tenantId,
      role: params.role,
      name: params.name,
      email: params.email,
      phone: params.phone,
      issuer: '180_identity',
      iat: now,
      exp: now + expiresInSeconds,
    };

    const header = { alg: 'HS256', typ: '180-JWT', kid: One80IdentityService.CLIENT_ID };
    const encodedHeader = One80IdentityService.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = One80IdentityService.base64UrlEncode(JSON.stringify(payload));

    const signature = crypto
      .createHmac('sha256', One80IdentityService.CLIENT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verifies a 180 Identity token
   */
  public static verifyToken(token: string): One80TokenPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Malformed 180 Identity token.');
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', One80IdentityService.CLIENT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new Error('Invalid 180 Identity token signature.');
    }

    const payload: One80TokenPayload = JSON.parse(One80IdentityService.base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      throw new Error('180 Identity token has expired.');
    }

    return payload;
  }

  /**
   * Verifies incoming webhook signatures from 180 Identity or 180 Pay
   */
  public static verifyWebhookSignature(rawBody: string | Buffer, signatureHeader: string): boolean {
    if (!signatureHeader || !rawBody) return false;

    const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const expectedSig = crypto
      .createHmac('sha256', One80IdentityService.WEBHOOK_SECRET)
      .update(bodyString)
      .digest('hex');

    const cleanSig = signatureHeader.replace(/^sha256=/, '').trim();
    const sigBuf = Buffer.from(cleanSig);
    const expBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  }
}
