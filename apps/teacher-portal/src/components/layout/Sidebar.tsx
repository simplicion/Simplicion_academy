'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Palette,
  BookOpen,
  FileCheck2,
  MessageCircleQuestion,
  Users,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { Badge } from '@simplicion/ui';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Portal Builder', href: '/builder', icon: Palette, badge: 'Live UI' },
  { label: 'Batches & Courses', href: '/batches', icon: BookOpen },
  { label: 'Payouts & Revenue', href: '/payouts', icon: Wallet, badge: 'Direct' },
  { label: 'CBT Question Bank', href: '/cbt', icon: FileCheck2 },
  { label: 'Student Doubts', href: '/doubts', icon: MessageCircleQuestion, badge: '3 New' },
  { label: 'Student Roster', href: '/students', icon: Users },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-800 shrink-0 sticky top-0">
      {/* Brand & Institute Header */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold truncate text-white">Humanities CUET</h2>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs text-slate-400 font-medium">Teacher Studio</span>
          </div>
        </div>
      </div>

      {/* Plan Status Banner */}
      <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">Pro Academy</span>
        </div>
        <Badge variant="success" size="sm">Active</Badge>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions: View Live Storefront & Teacher Profile */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <a
          href="http://localhost:3001/humanities-cuet"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
        >
          <span className="flex items-center space-x-2">
            <span>View Student Portal</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        <div className="flex items-center space-x-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-blue-300 border border-slate-600">
            DR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">Dr. Rajesh Varma</p>
            <p className="text-[10px] text-slate-400 truncate">rajesh@cuethumanities.in</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

