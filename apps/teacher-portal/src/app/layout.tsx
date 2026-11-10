import React from 'react';
import './globals.css';
import { StudioShell } from '../components/layout/StudioShell';

export const metadata = {
  title: 'Simplicion Academy | The Operating System for India\'s Educators',
  description: 'Launch your branded online academy in 60 seconds with instant student portal, live batches, CBT question bank, and instant payouts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased">
        <StudioShell>{children}</StudioShell>
      </body>
    </html>
  );
}
