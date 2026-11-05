'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@simplicion/ui';
import {
  Building2,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Globe,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { TenantDetailModal, AdminTenantItem } from '../../components/tenants/TenantDetailModal';

const INITIAL_TENANTS: AdminTenantItem[] = [
  {
    id: 'tenant_cuet',
    name: 'Humanities CUET Academy',
    slug: 'cuet-humanities',
    ownerName: 'Dr. Rajesh Varma',
    ownerEmail: 'rajesh@cuethumanities.in',
    ownerPhone: '+91 98765 43210',
    status: 'active',
    planId: 'plan_pro',
    planName: 'Pro Educator',
    customDomain: 'cuethumanities.in',
    studentsCount: 1420,
    panNumber: 'ABCDE1234F',
    bankAccount: '••••••••8912',
    ifsc: 'HDFC0001234',
    createdAt: '15 Oct 2026',
  },
  {
    id: 'tenant_apex_neet',
    name: 'Apex NEET & Medical Academy',
    slug: 'apex-neet',
    ownerName: 'Dr. Sunita Kapoor',
    ownerEmail: 'sunita@apexneet.in',
    ownerPhone: '+91 98111 22334',
    status: 'draft',
    planId: 'plan_pro',
    planName: 'Pro Educator',
    studentsCount: 0,
    panNumber: 'XYZPK9876L',
    bankAccount: '••••••••4521',
    ifsc: 'ICIC0005678',
    createdAt: '05 Nov 2026',
  },
  {
    id: 'tenant_commerce_hub',
    name: 'Commerce Catalyst CA Foundation',
    slug: 'commerce-catalyst',
    ownerName: 'CA Aman Singhania',
    ownerEmail: 'aman@commercehub.com',
    ownerPhone: '+91 97222 33445',
    status: 'draft',
    planId: 'plan_starter',
    planName: 'Starter Plan',
    studentsCount: 0,
    panNumber: 'PQRSM3456N',
    bankAccount: '••••••••3109',
    ifsc: 'SBIN0009988',
    createdAt: '05 Nov 2026',
  },
  {
    id: 'tenant_test_bad',
    name: 'FastTrack Piracy Test Series',
    slug: 'fasttrack-test',
    ownerName: 'Unknown Operator',
    ownerEmail: 'bad@actor.com',
    ownerPhone: '+91 90000 00000',
    status: 'suspended',
    planId: 'plan_starter',
    planName: 'Starter Plan',
    studentsCount: 42,
    panNumber: 'BADACTOR01',
    bankAccount: '••••••••0000',
    ifsc: 'PUNB0001111',
    createdAt: '28 Oct 2026',
    suspensionReason: 'DMCA copyright infringement complaint for unauthorized distribution of copyrighted test papers.',
  },
];

export default function TenantDirectoryPage() {
  const [tenants, setTenants] = useState<AdminTenantItem[]>(INITIAL_TENANTS);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'active' | 'suspended'>('all');
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<AdminTenantItem | null>(null);

  const handleApprove = (id: string) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'active' } : t))
    );
  };

  const handleSuspend = (id: string, reason: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'suspended', suspensionReason: reason } : t
      )
    );
  };

  const handleReactivate = (id: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'active', suspensionReason: undefined } : t
      )
    );
  };

  const filtered = tenants.filter((t) => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Tenant Directory & Governance</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review onboarding applications, verify teacher credentials, approve domains, and manage lifecycle state.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          {(['all', 'draft', 'active', 'suspended'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded text-xs font-bold capitalize transition ${
                filterStatus === status ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search institutes by name, slug or owner..."
            className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Institute</th>
                <th className="py-3 px-4">Educator Owner</th>
                <th className="py-3 px-4">SaaS Tier</th>
                <th className="py-3 px-4">Students</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <span className="text-[11px] font-mono text-slate-400">
                      {t.customDomain ? `https://${t.customDomain}` : `https://${t.slug}.simplicion.app`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{t.ownerName}</p>
                    <span className="text-[10px] text-slate-400">{t.ownerPhone}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {t.planName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{t.studentsCount}</td>
                  <td className="py-3.5 px-4">
                    {t.status === 'active' && <Badge variant="success" size="sm">Active</Badge>}
                    {t.status === 'draft' && <Badge variant="warning" size="sm">Draft Review</Badge>}
                    {t.status === 'suspended' && <Badge variant="danger" size="sm">Suspended</Badge>}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTenant(t)}
                      className="text-[11px] py-1 px-2.5 font-bold"
                    >
                      Inspect KYC & Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Detail Modal */}
      <TenantDetailModal
        tenant={selectedTenant}
        isOpen={Boolean(selectedTenant)}
        onClose={() => setSelectedTenant(null)}
        onApprove={handleApprove}
        onSuspend={handleSuspend}
        onReactivate={handleReactivate}
      />
    </div>
  );
}

