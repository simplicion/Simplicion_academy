'use client';

import React from 'react';
import { Bell, Search, Plus, ExternalLink, HelpCircle } from 'lucide-react';
import { Button, Badge } from '@simplicion/ui';
import Link from 'next/link';

export interface TeacherHeaderProps {
  title?: string;
  subtitle?: string;
}

export const TeacherHeader: React.FC<TeacherHeaderProps> = ({
  title = 'Educator Studio',
  subtitle,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search batches, questions, students..."
            className="w-64 pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Quick Action Button */}
        <Link href="/batches">
          <Button variant="primary" size="sm" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Batch</span>
          </Button>
        </Link>

        {/* Notifications */}
        <button
          type="button"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5"></span>
        </button>
      </div>
    </header>
  );
};

