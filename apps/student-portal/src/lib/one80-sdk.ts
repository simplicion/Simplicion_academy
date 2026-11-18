'use client';

export const ONE80_SDK_URL = 'https://profile.180core.cloud/sdk/v1/180-core-sdk.js';
export const ONE80_CLIENT_ID =
  process.env.NEXT_PUBLIC_180_CLIENT_ID || '180_client_3f697aec4c406a407979d708780106f0';

export interface One80AuthResult {
  code?: string;
  token?: string;
  accessToken?: string;
  idToken?: string;
  state?: string;
  user?: {
    id?: string;
    sub?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
}

declare global {
  interface Window {
    OneEightyAuth?: {
      openBottomSheet: (options: Record<string, any>) => Promise<any>;
      signIn: (options: Record<string, any>) => Promise<any>;
      signOut?: () => void;
    };
    OneEightyPay?: {
      openBottomSheet: (options: Record<string, any>) => Promise<any>;
      checkout: (options: Record<string, any>) => Promise<any>;
    };
  }
}

let sdkPromise: Promise<void> | null = null;

export function ensureOne80SdkLoaded(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.OneEightyAuth) return Promise.resolve();

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${ONE80_SDK_URL}"]`
      );
      if (existing) {
        if (window.OneEightyAuth) {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Failed to load 180 Core SDK')), {
          once: true,
        });
        return;
      }

      const script = document.createElement('script');
      script.src = ONE80_SDK_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load 180 Core SDK'));
      document.head.appendChild(script);
    });
  }

  return sdkPromise;
}

/**
 * Opens the official 180 Identity hosted bottom sheet produced directly by 180 Core SDK.
 * Zero custom auth UI is rendered by our application.
 */
export async function openOne80IdentityBottomSheet(options: {
  onSuccess: (result: One80AuthResult) => void;
  onError?: (err: any) => void;
  onCancel?: () => void;
}): Promise<void> {
  await ensureOne80SdkLoaded();

  if (!window.OneEightyAuth) {
    throw new Error('180 Identity SDK is not available.');
  }

  const redirectUri = `${window.location.origin}/`;

  await window.OneEightyAuth.openBottomSheet({
    clientId: ONE80_CLIENT_ID,
    redirectUri,
    scope: 'openid profile email',
    uxMode: 'bottom_sheet',
    onSuccess: options.onSuccess,
    onError: options.onError,
    onCancel: options.onCancel,
  });
}

/**
 * Opens the official 180 Pay hosted bottom sheet (whole currency units per 180 Pay spec).
 */
export async function openOne80PayBottomSheet(options: {
  amount: number;
  currency?: string;
  title: string;
  description?: string;
  orderId?: string;
  sessionId?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess?: (result: any) => void;
  onError?: (err: any) => void;
  onCancel?: () => void;
}): Promise<void> {
  await ensureOne80SdkLoaded();

  if (!window.OneEightyPay) {
    throw new Error('180 Pay SDK is not available.');
  }

  await window.OneEightyPay.openBottomSheet({
    clientId: ONE80_CLIENT_ID,
    amount: options.amount, // Whole currency units (e.g., 4000 for ₹4,000 INR)
    currency: options.currency || 'INR',
    title: options.title,
    description: options.description,
    orderId: options.orderId,
    sessionId: options.sessionId,
    customerEmail: options.customerEmail,
    customerPhone: options.customerPhone,
    uxMode: 'bottom_sheet',
    onSuccess: options.onSuccess,
    onError: options.onError,
    onCancel: options.onCancel,
  });
}
