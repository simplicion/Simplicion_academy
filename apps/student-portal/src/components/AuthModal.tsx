'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '@simplicion/ui';
import { Phone, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { name: string; phone: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [mockCode, setMockCode] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Deterministic demo code for frictionless testing
      const generatedCode = '123456';
      setMockCode(generatedCode);
      setIsLoading(false);
      setStep('otp');
      setCountdown(30);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.trim() !== mockCode && otp.trim() !== '123456') {
      setError('Invalid OTP code. Please enter the 6-digit code shown above.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const studentName = name.trim() || 'Aspirant';
      const userPayload = { name: studentName, phone };
      localStorage.setItem('simplicion_student', JSON.stringify(userPayload));
      onSuccess(userPayload);
    }, 400);
  };

  const resetModal = () => {
    setStep('phone');
    setPhone('');
    setName('');
    setOtp('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetModal}
      title={step === 'phone' ? 'Login or Create Account' : 'Verify Phone Number'}
      description={
        step === 'phone'
          ? 'Enter your mobile number to access classes, tests, and study notes.'
          : `We sent a 6-digit verification code to +91 ${phone}`
      }
    >
      {error && (
        <div className="mb-4 p-3 text-xs bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Mobile Number"
            placeholder="10-digit phone number"
            type="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            <span>Continue with OTP</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-[11px] text-center text-slate-500">
            By continuing, you agree to our Terms of Service & Privacy Policy (India DPDP compliant).
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
            <span>Demo Mode OTP Code:</span>
            <span className="font-mono font-bold tracking-widest text-sm bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-700">
              {mockCode || '123456'}
            </span>
          </div>

          <Input
            label="6-Digit OTP"
            placeholder="123456"
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            className="text-center font-mono tracking-widest text-lg font-bold"
            autoFocus
            required
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            <span>Verify & Access Portal</span>
          </Button>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="text-[var(--brand-primary,#2563eb)] hover:underline font-medium"
            >
              Change number
            </button>
            <span>
              {countdown > 0 ? (
                `Resend code in ${countdown}s`
              ) : (
                <button
                  type="button"
                  onClick={() => setCountdown(30)}
                  className="text-[var(--brand-primary,#2563eb)] hover:underline font-semibold"
                >
                  Resend OTP
                </button>
              )}
            </span>
          </div>
        </form>
      )}
    </Modal>
  );
};

