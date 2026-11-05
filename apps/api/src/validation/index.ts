import { Request, Response, NextFunction } from 'express';

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export type ValidatorFn<T> = (data: any) => { valid: true; data: T } | { valid: false; errors: ValidationErrorItem[] };

/**
 * Validates Phone OTP Request Payload
 */
export const validateRequestOtp: ValidatorFn<{ phone: string }> = (body) => {
  const errors: ValidationErrorItem[] = [];
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Request body must be a JSON object.' }] };
  }

  const phone = body.phone;
  if (!phone || typeof phone !== 'string') {
    errors.push({ field: 'phone', message: 'Phone number is required and must be a string.' });
  } else {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 13) {
      errors.push({ field: 'phone', message: 'Phone number must contain between 10 and 13 digits.' });
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true, data: { phone } };
};

/**
 * Validates OTP Verification Payload
 */
export const validateVerifyOtp: ValidatorFn<{ phone: string; code: string }> = (body) => {
  const errors: ValidationErrorItem[] = [];
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Request body must be a JSON object.' }] };
  }

  const phoneRes = validateRequestOtp(body);
  if (!phoneRes.valid) {
    errors.push(...phoneRes.errors);
  }

  const code = body.code;
  if (!code || typeof code !== 'string') {
    errors.push({ field: 'code', message: '6-digit OTP code is required.' });
  } else if (!/^[0-9]{6}$/.test(code.trim())) {
    errors.push({ field: 'code', message: 'OTP must be an exact 6-digit numeric code.' });
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true, data: { phone: body.phone, code: body.code } };
};

/**
 * Validates Order Creation Payload
 */
export const validateCreateOrder: ValidatorFn<{ offeringId: string; grossAmount: number; userId?: string }> = (body) => {
  const errors: ValidationErrorItem[] = [];
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Request body must be a JSON object.' }] };
  }

  if (!body.offeringId || typeof body.offeringId !== 'string' || !body.offeringId.trim()) {
    errors.push({ field: 'offeringId', message: 'Offering ID is required.' });
  }

  if (body.grossAmount === undefined || typeof body.grossAmount !== 'number' || body.grossAmount < 0) {
    errors.push({ field: 'grossAmount', message: 'Gross amount must be a non-negative number.' });
  }

  return errors.length > 0
    ? { valid: false, errors }
    : { valid: true, data: { offeringId: body.offeringId, grossAmount: body.grossAmount, userId: body.userId } };
};

/**
 * Validates No-Code Theme Customizer Payload
 */
export const validateThemeConfig: ValidatorFn<{
  primaryColor?: string;
  borderRadius?: string;
  headerLayout?: string;
}> = (body) => {
  const errors: ValidationErrorItem[] = [];
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Request body must be a JSON object.' }] };
  }

  if (body.primaryColor !== undefined) {
    if (typeof body.primaryColor !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(body.primaryColor)) {
      errors.push({ field: 'primaryColor', message: 'Primary color must be a valid 6-character hex code (e.g. #2563EB).' });
    }
  }

  if (body.borderRadius !== undefined) {
    const allowed = ['none', 'sm', 'md', 'lg', 'full', '0px', '4px', '8px', '16px', '9999px'];
    if (!allowed.includes(body.borderRadius)) {
      errors.push({ field: 'borderRadius', message: `Border radius must be one of: ${allowed.join(', ')}.` });
    }
  }

  if (body.headerLayout !== undefined) {
    const allowed = ['login-left', 'login-right', 'split', 'centered'];
    if (!allowed.includes(body.headerLayout)) {
      errors.push({ field: 'headerLayout', message: `Header layout must be one of: ${allowed.join(', ')}.` });
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true, data: body };
};

/**
 * Express Middleware Factory for Input Validation
 */
export function validateBody<T>(validator: ValidatorFn<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = validator(req.body);
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed for request payload.',
        errors: result.errors,
        details: result.errors,
      });
    }
    req.body = result.data;
    next();
  };
}

