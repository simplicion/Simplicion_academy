import { Request, Response, NextFunction } from 'express';

export interface RateLimiterOptions {
  windowMs: number; // e.g. 15 * 60 * 1000 (15 min)
  maxRequests: number; // e.g. 5
  keyGenerator?: (req: Request) => string;
  message?: string;
}

export class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(public readonly options: RateLimiterOptions) {}

  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const now = Date.now();
      const windowStart = now - this.options.windowMs;

      // Extract client key: custom key generator or IP/phone
      let key: string;
      if (this.options.keyGenerator) {
        key = this.options.keyGenerator(req);
      } else {
        const ip = req.ip || req.socket?.remoteAddress || 'unknown-ip';
        const phone = req.body?.phone ? String(req.body.phone).replace(/\D/g, '') : '';
        key = phone ? `${ip}:${phone}` : ip;
      }

      // Filter timestamps outside current window
      const timestamps = (this.requests.get(key) || []).filter(t => t > windowStart);

      if (timestamps.length >= this.options.maxRequests) {
        const oldest = timestamps[0];
        const retryAfterSeconds = Math.max(1, Math.ceil((oldest + this.options.windowMs - now) / 1000));
        res.setHeader('Retry-After', retryAfterSeconds.toString());
        res.status(429).json({
          success: false,
          error: this.options.message || 'Too many requests. Please try again later.',
          retryAfter: retryAfterSeconds,
        });
        return;
      }

      // Record this request
      timestamps.push(now);
      this.requests.set(key, timestamps);

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', this.options.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', (this.options.maxRequests - timestamps.length).toString());

      next();
    };
  }

  public reset(): void {
    this.requests.clear();
  }
}

/**
 * Standard preset: Max 5 OTP requests per 15 minutes
 */
export const otpRequestLimiter = new SlidingWindowRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many OTP requests from this identifier. Please try again after 15 minutes.',
});

