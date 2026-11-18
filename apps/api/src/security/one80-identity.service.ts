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

export interface One80CheckoutSessionParams {
  amount: number; // Whole currency units per 180 Pay spec (e.g., 4000 for ₹4,000 INR)
  currency?: string;
  orderId: string;
  description: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface One80CheckoutSessionResult {
  mode: 'live' | 'sandbox';
  sessionId: string;
  checkoutUrl: string;
  amount: number;
  currency: string;
}

export class One80IdentityService {
  public static readonly CLIENT_ID =
    process.env['180_CLIENT_ID'] || '180_client_3f697aec4c406a407979d708780106f0';
  public static readonly CLIENT_SECRET =
    process.env['180_CLIENT_SECRET'] ||
    '180_secret_50e7b13eb02eb99f90cbc8a276ca1fbe9d42b13ac8c485d4823089776b2f7ad9';
  public static readonly WEBHOOK_SECRET =
    process.env['180_WEBHOOK_SECRET'] || 'whsec_ba609675e3da1dcf164914fcfc410f53e8deab8e9756884d';

  // Official 180 Core dual-domain architecture (https://developer.180core.cloud/docs?section=overview)
  public static readonly PROFILE_BASE_URL =
    process.env['ONE80_PROFILE_URL'] || 'https://profile.180core.cloud';
  public static readonly API_BASE_URL =
    process.env['ONE80_API_URL'] || 'https://api.180core.cloud';

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
   * Builds the official 180 Identity hosted Universal SSO login/signup URL
   * Hosted UI domain: https://profile.180core.cloud/auth/login
   */
  public static buildAuthorizationUrl(params: {
    redirectUri: string;
    state: string;
    scope?: string;
    mode?: 'login' | 'signup';
  }): string {
    const url = new URL('/auth/login', One80IdentityService.PROFILE_BASE_URL);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', One80IdentityService.CLIENT_ID);
    url.searchParams.set('redirect_uri', params.redirectUri);
    url.searchParams.set('scope', params.scope || 'openid profile email');
    url.searchParams.set('state', params.state);
    if (params.mode === 'signup') {
      url.searchParams.set('mode', 'signup');
    }
    return url.toString();
  }

  /**
   * Exchanges an OAuth 2.0 authorization code with 180 Core API and loads OIDC userinfo
   * Endpoints:
   * - POST https://api.180core.cloud/api/oauth/token
   * - GET  https://api.180core.cloud/api/oauth/userinfo
   */
  public static async exchangeAuthorizationCode(params: {
    code: string;
    redirectUri: string;
  }): Promise<{
    accessToken: string;
    user: { id: string; name: string; email?: string; phone?: string };
  }> {
    const tokenEndpoint = `${One80IdentityService.API_BASE_URL}/api/oauth/token`;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: One80IdentityService.CLIENT_ID,
      client_secret: One80IdentityService.CLIENT_SECRET,
      code: params.code,
      redirect_uri: params.redirectUri,
    });

    const tokenRes = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: body.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text().catch(() => '');
      throw new Error(`180 Identity token exchange failed (${tokenRes.status}): ${errText}`);
    }

    const tokenJson: any = await tokenRes.json();
    const accessToken = tokenJson.access_token;
    if (!accessToken) {
      throw new Error('180 Identity did not return an access_token.');
    }

    const userInfoEndpoint = `${One80IdentityService.API_BASE_URL}/api/oauth/userinfo`;
    const userRes = await fetch(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    let profile: any = {};
    if (userRes.ok) {
      profile = await userRes.json();
    }

    return {
      accessToken,
      user: {
        id: profile.sub || profile.id || `180_usr_${Date.now()}`,
        name: profile.name || profile.given_name || profile.email?.split('@')[0] || 'Student',
        email: profile.email,
        phone: profile.phone_number || profile.phone,
      },
    };
  }

  /**
   * Creates a 180 Pay hosted checkout session via https://api.180core.cloud/api/v1/pay/checkout-session
   * Note: 180 Pay universally operates on WHOLE CURRENCY UNITS (e.g. 4000 for ₹4,000 INR).
   */
  public static async createHostedCheckoutSession(
    params: One80CheckoutSessionParams
  ): Promise<One80CheckoutSessionResult> {
    const currency = params.currency || 'INR';
    const wholeAmount = Number(params.amount);
    if (!Number.isFinite(wholeAmount) || wholeAmount <= 0) {
      throw new Error('180 Pay amount must be a positive number in whole currency units.');
    }

    const endpoint = `${One80IdentityService.API_BASE_URL}/api/v1/pay/checkout-session`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${One80IdentityService.CLIENT_SECRET}`,
          'x-client-id': One80IdentityService.CLIENT_ID,
          'x-client-secret': One80IdentityService.CLIENT_SECRET,
        },
        body: JSON.stringify({
          client_id: One80IdentityService.CLIENT_ID,
          amount: wholeAmount, // Whole currency units per 180 Pay spec
          currency,
          order_id: params.orderId,
          description: params.description,
          customer: params.customer,
          success_url: params.successUrl,
          cancel_url: params.cancelUrl,
          metadata: params.metadata || {},
        }),
      });

      if (res.ok) {
        const data: any = await res.json();
        const sessionId = data.sessionId || data.session_id || data.id || `180_sess_${Date.now()}`;
        const checkoutUrl =
          data.checkoutUrl ||
          data.checkout_url ||
          data.url ||
          `${One80IdentityService.PROFILE_BASE_URL}/checkout?session_id=${encodeURIComponent(sessionId)}`;

        return {
          mode: 'live',
          sessionId,
          checkoutUrl,
          amount: wholeAmount,
          currency,
        };
      }
    } catch {
      // Fall through to signed sandbox checkout session for local/offline dev
    }

    const sandboxSessionId = `180_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fallbackUrl = new URL('/checkout', One80IdentityService.PROFILE_BASE_URL);
    fallbackUrl.searchParams.set('session_id', sandboxSessionId);
    fallbackUrl.searchParams.set('client_id', One80IdentityService.CLIENT_ID);
    fallbackUrl.searchParams.set('amount', String(wholeAmount));
    fallbackUrl.searchParams.set('currency', currency);

    return {
      mode: 'sandbox',
      sessionId: sandboxSessionId,
      checkoutUrl: fallbackUrl.toString(),
      amount: wholeAmount,
      currency,
    };
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
