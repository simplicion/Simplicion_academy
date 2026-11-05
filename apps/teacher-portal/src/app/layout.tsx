import React from 'react';
import './globals.css';
import { Sidebar } from '../components/layout/Sidebar';
import { TeacherHeader } from '../components/layout/TeacherHeader';
import { ImpersonationBanner } from '../components/layout/ImpersonationBanner';

export const metadata = {
  title: 'Teacher Studio | Simplicion Academy',
  description: 'Manage your academy batches, portal design, question bank, and students.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased">
        <ImpersonationBanner />
        <div className="flex-1 flex min-w-0 h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
            <TeacherHeader />
            <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
