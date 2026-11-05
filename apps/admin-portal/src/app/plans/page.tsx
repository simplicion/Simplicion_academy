'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@simplicion/ui';
import {
  Gem,
  CheckCircle,
  Users,
  HardDrive,
  IndianRupee,
  Layers,
  Settings,
  Sparkles,
} from 'lucide-react';

export interface PlanConfig {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: number;
  maxStudents: number;
  maxStorageGb: number;
  platformFeePercent: number;
  customDomainAllowed: boolean;
  activeTenantsCount: number;
  features: string[];
}

const INITIAL_PLANS: PlanConfig[] = [
  {
    id: 'plan_starter',
    name: 'Starter Tier',
    priceMonthly: 2999,
    maxStudents: 100,
    maxStorageGb: 5,
    platformFeePercent: 5.0,
    customDomainAllowed: false,
    activeTenantsCount: 18,
    features: [
      'Up to 100 Enrolled Students',
      '5 GB Watermarked Notes & Video Storage',
      'Shared Subdomain (*.simplicion.app)',
      '5.0% Razorpay Route Platform Fee',
      'Community Doubt Forum',
    ],
  },
  {
    id: 'plan_pro',
    name: 'Pro Educator',
    badge: 'Most Popular',
    priceMonthly: 7999,
    maxStudents: 1500,
    maxStorageGb: 50,
    platformFeePercent: 3.0,
    customDomainAllowed: true,
    activeTenantsCount: 26,
    features: [
      'Up to 1,500 Enrolled Students',
      '50 GB High-Yield Video & Notes Storage',
      'Custom Domain Support (e.g. cuethumanities.in)',
      '3.0% Platform Commission Take-Rate',
      'NTA CUET Computer-Based Test Simulator',
      'Priority Doubt Ticketing Queue',
    ],
  },
  {
    id: 'plan_enterprise',
    name: 'Institutional Enterprise',
    priceMonthly: 19999,
    maxStudents: 10000,
    maxStorageGb: 500,
    platformFeePercent: 1.5,
    customDomainAllowed: true,
    activeTenantsCount: 4,
    features: [
      '10,000+ Enrolled Students Cap',
      '500 GB Dedicated Media Storage',
      'Custom Domain + Dedicated SSL',
      '1.5% Wholesale Platform Take-Rate',
      'White-Labeled Android/iOS App Support',
      '24/7 Dedicated Technical SLA',
    ],
  },
];

export default function PlansGovernancePage() {
  const [plans, setPlans] = useState<PlanConfig[]>(INITIAL_PLANS);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">SaaS Subscription Plans & Entitlements</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure tier quotas, student caps, storage allocation, and automated Razorpay Route platform fee take-rates.
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`p-6 flex flex-col justify-between relative overflow-hidden transition-all shadow-sm ${
              plan.badge ? 'border-2 border-indigo-600 shadow-indigo-100' : 'hover:border-slate-300'
            }`}
          >
            {plan.badge && (
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                {plan.badge}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-slate-900">₹ {plan.priceMonthly}</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
              </div>

              {/* Commercial Metrics */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Platform Commission:</span>
                  <span className="font-bold text-indigo-700">{plan.platformFeePercent}% per sale</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Student Capacity:</span>
                  <span className="font-bold text-slate-800">{plan.maxStudents.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Active Institutes:</span>
                  <span className="font-bold text-emerald-700">{plan.activeTenantsCount} Tenants</span>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Included Entitlements
                </span>
                <ul className="space-y-2 text-xs text-slate-700">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">{plan.id}</span>
              <Button variant="outline" size="sm" className="text-xs font-bold gap-1">
                <Settings className="w-3.5 h-3.5" />
                <span>Edit Quotas</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

