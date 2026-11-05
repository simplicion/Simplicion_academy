'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe,
  Building2,
  Gem,
  CreditCard,
  ShieldAlert,
  ClipboardList,
  Sparkles,
  Server,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@simplicion/ui';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export const adminNavItems: AdminNavItem[] = [
  { label: 'Platform Overview', href: '/', icon: Globe },
  { label: 'Tenant Directory & KYC', href: '/tenants', icon: Building2, badge: '2 Review' },
  { label: 'SaaS Plans & Quotas', href: '/plans', icon: Gem },
  { label: 'Split Settlements', href: '/settlements', icon: CreditCard },
  { label: 'Audited Impersonation', href: '/impersonate', icon: ShieldAlert, badge: 'SAFS-02' },
  { label: 'System Audit Logs', href: '/audit', icon: ClipboardList },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 text-slate-100 flex flex-col h-screen border-r border-slate-800 shrink-0 sticky top-0">
      {/* Brand & Super Admin Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Server className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-black truncate text-white tracking-tight">Simplicion OS</h2>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
              Super Admin
            </span>
          </div>
        </div>
      </div>

      {/* Security Status Box */}
      <div className="px-4 py-2.5 mx-3 my-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-300">Tenant Isolation</span>
        </div>
        <Badge variant="success" size="sm">Strict (SAFS-02)</Badge>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-indigo-700 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Super Admin Session Info */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center space-x-3 px-2 py-2 bg-slate-900/60 rounded-lg border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/40">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">Platform Operator</p>
            <p className="text-[10px] text-slate-500 truncate">admin@simplicion.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

