import React from 'react';
import './globals.css';
import { StudioShell } from '../components/layout/StudioShell';

export const metadata = {
  title: 'Learnings Simplicion',
  description:
    'Launch your independent online academy on learnings.simplicion.com with instant student portals, live batches, CBT mock tests, and 180 Pay payouts.',
  icons: {
    icon: '/logo-black.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://profile.180core.cloud/sdk/v1/180-core-sdk.js" async />
      </head>
      <body className="min-h-screen bg-white flex flex-col text-[#0f172a] antialiased">
        <StudioShell>{children}</StudioShell>
      </body>
    </html>
  );
}
