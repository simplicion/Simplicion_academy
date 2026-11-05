'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  IndianRupee,
  Users,
  ShieldCheck,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Server,
  Layers,
} from 'lucide-react';
import { Card, Button, Badge } from '@simplicion/ui';
import { PlatformMetricCard } from '../components/dashboard/PlatformMetricCard';

export default function PlatformAdminOverviewPage() {
  const pendingTenants = [
    {
      id: 'tenant_apex_neet',
      name: 'Apex NEET & Medical Academy',
      slug: 'apex-neet',
      owner: 'Dr. Sunita Kapoor (+91 98111 22334)',
      plan: 'Pro Educator',
      appliedAt: '2 hours ago',
      kycStatus: 'Verified (PAN + GSTIN matched)',
    },
    {
      id: 'tenant_commerce_hub',
      name: 'Commerce Catalyst CA Foundation',
      slug: 'commerce-catalyst',
      owner: 'CA Aman Singhania (+91 97222 33445)',
      plan: 'Starter Plan',
      appliedAt: '5 hours ago',
      kycStatus: 'Pending Bank Verification',
    },
  ];

  const recentTransfers = [
    {
      id: 'tr_8912',
      tenant: 'Humanities CUET Academy',
      orderId: 'order_cuet_901',
      gross: '₹ 4,999',
      platformFee: '₹ 150 (3%)',
      payout: '₹ 4,849',
      status: 'settled',
    },
    {
      id: 'tr_8911',
      tenant: 'Apex NEET & Medical Academy',
      orderId: 'order_neet_842',
      gross: '₹ 12,000',
      platformFee: '₹ 360 (3%)',
      payout: '₹ 11,640',
      status: 'settled',
    },
    {
      id: 'tr_8910',
      tenant: 'Humanities CUET Academy',
      orderId: 'order_cuet_900',
      gross: '₹ 1,999',
      platformFee: '₹ 60 (3%)',
      payout: '₹ 1,939',
      status: 'settled',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="outline" size="sm" className="mb-3 border-indigo-400/50 text-indigo-300">
            Platform Operator Console
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Simplicion Network Control
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Multi-tenant engine currently hosting 48 active educational institutes with 28,450 concurrent students. 2 new onboarding applications are awaiting compliance approval.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/tenants">
              <Button variant="primary" size="md" className="gap-2 bg-indigo-600 hover:bg-indigo-500 font-bold">
                <Building2 className="w-4 h-4" />
                <span>Review Onboarding (2)</span>
              </Button>
            </Link>
            <Link href="/impersonate">
              <Button variant="outline" size="md" className="gap-2 text-white border-slate-700 hover:bg-slate-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Audited Impersonation</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute -right-8 -bottom-8 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* Global Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlatformMetricCard
          title="Platform GMV"
          value="₹ 2.45 Cr"
          change="+28.4%"
          trend="up"
          icon={IndianRupee}
          description="total course sales"
        />
        <PlatformMetricCard
          title="Platform Net Commission"
          value="₹ 7.37 L"
          change="+28.4%"
          trend="up"
          icon={IndianRupee}
          description="avg 3.0% take-rate"
        />
        <PlatformMetricCard
          title="Active Institutes"
          value="48 Tenants"
          change="+6 this month"
          trend="up"
          icon={Building2}
          description="100% tenant isolation"
        />
        <PlatformMetricCard
          title="Total Students"
          value="28,450"
          change="+32.1%"
          trend="up"
          icon={Users}
          description="across all institutes"
        />
      </div>

      {/* Grid: Pending Onboarding & Recent Split Transfers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pending Tenants Review (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Institute Onboarding Queue</h3>
              <p className="text-xs text-slate-500">KYC verification and approval for white-label student portals</p>
            </div>
            <Link href="/tenants">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <span>All Tenants</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {pendingTenants.map((tenant) => (
              <Card key={tenant.id} className="p-4 hover:border-slate-300 transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{tenant.name}</h4>
                    <span className="text-xs font-mono text-slate-500">
                      https://{tenant.slug}.simplicion.app
                    </span>
                  </div>
                  <Badge variant="warning" size="sm">
                    KYC Review Required
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Educator Owner</span>
                    <span className="font-semibold text-slate-800">{tenant.owner}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">SaaS Plan Tier</span>
                    <span className="font-semibold text-indigo-700">{tenant.plan}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Applied {tenant.appliedAt}</span>
                  </span>

                  <Link href="/tenants">
                    <Button variant="primary" size="sm" className="text-xs py-1 px-3 bg-emerald-600 hover:bg-emerald-700">
                      Verify & Approve
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Split Transfers (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Razorpay Route Transfers</h3>
              <p className="text-xs text-slate-500">Automated split settlement ledger</p>
            </div>
            <Link href="/settlements">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <span>Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 text-xs">
              {recentTransfers.map((tx) => (
                <div key={tx.id} className="p-3.5 hover:bg-slate-50 transition space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{tx.tenant}</span>
                    <Badge variant="success" size="sm">
                      Settled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-mono text-[11px]">{tx.orderId}</span>
                    <span className="font-bold text-slate-900">{tx.gross}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Platform: <strong className="text-indigo-600">{tx.platformFee}</strong></span>
                    <span>Teacher Payout: <strong className="text-emerald-700">{tx.payout}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

