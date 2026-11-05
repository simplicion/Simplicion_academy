import React from 'react';
import './globals.css';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AdminHeader } from '../components/layout/AdminHeader';

export const metadata = {
  title: 'Simplicion OS | Platform Super Admin',
  description: 'Multi-tenant governance, SaaS subscription limits, and split settlement ledger.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex text-slate-900 antialiased">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <AdminHeader />
          <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}

