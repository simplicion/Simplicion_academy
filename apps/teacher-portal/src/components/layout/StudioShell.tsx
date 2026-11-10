'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TeacherHeader } from './TeacherHeader';
import { ImpersonationBanner } from './ImpersonationBanner';

export const StudioShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>;
  }

  return (
    <>
      <ImpersonationBanner />
      <div className="flex-1 flex min-w-0 h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <TeacherHeader />
          <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
        </div>
      </div>
    </>
  );
};
