import { describe, it, expect } from 'vitest';
import { OtpSession, UserAggregate } from '../src';

describe('@simplicion/domain-identity Verification Invariants', () => {
  it('should generate a 6-digit numeric OTP', () => {
    const { session, rawCode } = OtpSession.generate('otp-01', 'tenant-01', '9876543210');

    expect(rawCode).toMatch(/^\d{6}$/);
    expect(session.phone).toBe('9876543210');
    expect(session.isVerified).toBe(false);
  });

  it('should verify matching OTP code successfully', () => {
    const { session, rawCode } = OtpSession.generate('otp-02', 'tenant-01', '+91 98765 43210');
    const isSuccess = session.verify(rawCode);

    expect(isSuccess).toBe(true);
    expect(session.isVerified).toBe(true);
  });

  it('should track failed attempts and lock out after 5 failures', () => {
    const { session } = OtpSession.generate('otp-03', 'tenant-01', '9876543210');

    // 4 wrong attempts
    for (let i = 0; i < 4; i++) {
      expect(() => session.verify('000000')).toThrow('Invalid OTP code');
    }
    expect(session.attempts).toBe(4);

    // 5th wrong attempt
    expect(() => session.verify('000000')).toThrow();

    // 6th attempt should lock out
    expect(() => session.verify('000000')).toThrow('Maximum verification attempts exceeded');
  });

  it('should create a tenant-scoped student user', () => {
    const student = UserAggregate.createStudent('usr-01', 'tenant-cuet', '9876543210', 'Rahul Sharma');

    expect(student.tenantId).toBe('tenant-cuet');
    expect(student.role).toBe('student');
    expect(student.name).toBe('Rahul Sharma');
  });
});

