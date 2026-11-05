import { describe, it, expect } from 'vitest';
import {
  validateRequestOtp,
  validateVerifyOtp,
  validateCreateOrder,
  validateThemeConfig,
  validateBody,
} from '../src/validation/index';

describe('Zod / Type-Safe Request Payload Validation', () => {
  describe('validateRequestOtp', () => {
    it('accepts valid 10-digit Indian mobile number', () => {
      const result = validateRequestOtp({ phone: '9876543210' });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.phone).toBe('9876543210');
      }
    });

    it('accepts E.164 formatted number with country code', () => {
      const result = validateRequestOtp({ phone: '+919876543210' });
      expect(result.valid).toBe(true);
    });

    it('rejects missing or empty phone', () => {
      const result = validateRequestOtp({});
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors[0].field).toBe('phone');
      }
    });

    it('rejects short phone number (< 10 digits)', () => {
      const result = validateRequestOtp({ phone: '12345' });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors[0].message).toContain('between 10 and 13 digits');
      }
    });
  });

  describe('validateVerifyOtp', () => {
    it('accepts valid phone and 6-digit numeric OTP code', () => {
      const result = validateVerifyOtp({ phone: '9876543210', code: '482910' });
      expect(result.valid).toBe(true);
    });

    it('rejects non-numeric OTP code', () => {
      const result = validateVerifyOtp({ phone: '9876543210', code: '48AB10' });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.field === 'code')).toBe(true);
      }
    });

    it('rejects code with incorrect length (< 6 or > 6 digits)', () => {
      const result = validateVerifyOtp({ phone: '9876543210', code: '123' });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.field === 'code')).toBe(true);
      }
    });
  });

  describe('validateCreateOrder', () => {
    it('accepts valid order payload', () => {
      const result = validateCreateOrder({ offeringId: 'off_cuet_01', grossAmount: 4999 });
      expect(result.valid).toBe(true);
    });

    it('rejects missing offeringId and negative grossAmount', () => {
      const result = validateCreateOrder({ offeringId: '', grossAmount: -500 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toHaveLength(2);
      }
    });
  });

  describe('validateThemeConfig', () => {
    it('accepts valid hex colors and allowed border radii', () => {
      const result = validateThemeConfig({ primaryColor: '#2563EB', borderRadius: 'md' });
      expect(result.valid).toBe(true);
    });

    it('rejects invalid hex color format (e.g. non-hex or missing hash)', () => {
      const result = validateThemeConfig({ primaryColor: 'red' });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors[0].field).toBe('primaryColor');
      }
    });

    it('rejects unknown border radius token', () => {
      const result = validateThemeConfig({ borderRadius: 'extra-massive' });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors[0].field).toBe('borderRadius');
      }
    });
  });

  describe('validateBody Express Middleware Integration', () => {
    const middleware = validateBody(validateRequestOtp);

    it('calls next() when payload is valid', () => {
      const req: any = { body: { phone: '9876543210' } };
      const res: any = {};
      let nextCalled = false;

      middleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });

    it('returns HTTP 400 with detailed errors when payload is invalid', () => {
      const req: any = { body: { phone: 'bad' } };
      let statusCode = 0;
      let jsonBody: any = null;
      const res: any = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (body: any) => {
              jsonBody = body;
            },
          };
        },
      };

      middleware(req, res, () => {});

      expect(statusCode).toBe(400);
      expect(jsonBody.success).toBe(false);
      expect(jsonBody.errors).toBeInstanceOf(Array);
      expect(jsonBody.errors[0].field).toBe('phone');
    });
  });
});

