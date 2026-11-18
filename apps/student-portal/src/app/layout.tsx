import React from 'react';
import type { Metadata } from 'next';
import { generateThemeStyleString } from '@simplicion/ui';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FastApiProvider } from '../components/FastApiProvider';
import './globals.css';

export function generateMetadata(): Metadata {
  return {
    title: 'Learnings Simplicion | Online Academy & Student Portal',
    description:
      'Structured online courses, live interactive classes, study notes, practice tests, and direct educator doubt support.',
    keywords: ['online academy', 'courses', 'live classes', 'practice tests'],
    openGraph: {
      title: 'Learnings Simplicion | Online Academy & Student Portal',
      description:
        'Structured online courses, live interactive classes, study notes, practice tests, and direct educator doubt support.',
      siteName: 'Learnings Simplicion',
      locale: 'en_IN',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeStyle = generateThemeStyleString({
    primaryColor: '#2563eb',
    accentColor: '#1d4ed8',
    borderRadius: 'md',
    fontFamily: "'Inter', sans-serif" as any,
  });

  return (
    <html lang="en" style={{ cssText: themeStyle } as any}>
      <head>
        <script src="https://profile.180core.cloud/sdk/v1/180-core-sdk.js" async />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-brand antialiased">
        <FastApiProvider />
        <Header
          tenantName="Learnings Simplicion"
          tagline=""
          headerLayout="login-right"
          studyLabel="Study"
        />
        <main className="flex-1 animate-page-enter">{children}</main>
        <Footer tenantName="Learnings Simplicion" />
      </body>
    </html>
  );
}

