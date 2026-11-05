'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@simplicion/ui';
import {
  CreditCard,
  IndianRupee,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  RotateCcw,
  Download,
} from 'lucide-react';

export interface SplitSettlementRecord {
  id: string;
  orderId: string;
  timestamp: string;
  tenantName: string;
  studentPhone: string;
  grossAmount: number;
  platformFeePercent: number;
  platformFeeAmount: number;
  netPayoutAmount: number;
  status: 'settled' | 'pending' | 'failed';
  gatewayTransferId: string;
}

const INITIAL_SETTLEMENTS: SplitSettlementRecord[] = [
  {
    id: 'st_101',
    orderId: 'order_cuet_901',
    timestamp: '05 Nov 2026, 17:42',
    tenantName: 'Humanities CUET Academy',
    studentPhone: '+91 98765 •••••',
    grossAmount: 4999,
    platformFeePercent: 3.0,
    platformFeeAmount: 150,
    netPayoutAmount: 4849,
    status: 'settled',
    gatewayTransferId: 'trf_rzp_9847234',
  },
  {
    id: 'st_102',
    orderId: 'order_cuet_902',
    timestamp: '05 Nov 2026, 16:30',
    tenantName: 'Humanities CUET Academy',
    studentPhone: '+91 91234 •••••',
    grossAmount: 1999,
    platformFeePercent: 3.0,
    platformFeeAmount: 60,
    netPayoutAmount: 1939,
    status: 'settled',
    gatewayTransferId: 'trf_rzp_9847120',
  },
  {
    id: 'st_103',
    orderId: 'order_apex_842',
    timestamp: '05 Nov 2026, 15:10',
    tenantName: 'Apex NEET & Medical Academy',
    studentPhone: '+91 94567 •••••',
    grossAmount: 12000,
    platformFeePercent: 3.0,
    platformFeeAmount: 360,
    netPayoutAmount: 11640,
    status: 'settled',
    gatewayTransferId: 'trf_rzp_9846890',
  },
  {
    id: 'st_104',
    orderId: 'order_cuet_903',
    timestamp: '05 Nov 2026, 14:05',
    tenantName: 'Humanities CUET Academy',
    studentPhone: '+91 99887 •••••',
    grossAmount: 4999,
    platformFeePercent: 3.0,
    platformFeeAmount: 150,
    netPayoutAmount: 4849,
    status: 'pending',
    gatewayTransferId: 'trf_rzp_pending_01',
  },
  {
    id: 'st_105',
    orderId: 'order_comm_302',
    timestamp: '05 Nov 2026, 11:20',
    tenantName: 'Commerce Catalyst CA Foundation',
    studentPhone: '+91 97766 •••••',
    grossAmount: 2999,
    platformFeePercent: 5.0,
    platformFeeAmount: 150,
    netPayoutAmount: 2849,
    status: 'failed',
    gatewayTransferId: 'trf_rzp_fail_99',
  },
];

export default function SplitSettlementsLedgerPage() {
  const [records, setRecords] = useState<SplitSettlementRecord[]>(INITIAL_SETTLEMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'settled' | 'pending' | 'failed'>('all');

  const handleRetryTransfer = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'settled' } : r))
    );
    alert('Settlement re-triggered with Razorpay Route gateway.');
  };

  const filtered = records.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch =
      r.orderId.toLowerCase().includes(search.toLowerCase()) ||
      r.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      r.gatewayTransferId.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalGross = records.reduce((acc, r) => acc + r.grossAmount, 0);
  const totalPlatformFees = records.reduce((acc, r) => acc + r.platformFeeAmount, 0);
  const totalTeacherPayouts = records.reduce((acc, r) => acc + r.netPayoutAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Razorpay Route Split Settlements
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-tenant split transfers, platform commission deductions, and linked teacher bank accounts.
          </p>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
          <Download className="w-3.5 h-3.5" />
          <span>Export Ledger (CSV)</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-bold uppercase text-slate-500">Processed Volume (Gross)</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">₹ {totalGross.toLocaleString('en-IN')}</h3>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{records.length} transactions</span>
        </Card>
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-bold uppercase text-indigo-600">Platform Commission Retained</span>
          <h3 className="text-2xl font-black text-indigo-700 mt-1">₹ {totalPlatformFees.toLocaleString('en-IN')}</h3>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Automated split fee</span>
        </Card>
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-bold uppercase text-emerald-600">Teacher Net Disbursed</span>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">₹ {totalTeacherPayouts.toLocaleString('en-IN')}</h3>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Sent to linked bank accounts</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          {(['all', 'settled', 'pending', 'failed'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded text-xs font-bold capitalize transition ${
                statusFilter === status ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600'
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
            placeholder="Search order ID, institute, or transfer ID..."
            className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order / Gateway ID</th>
                <th className="py-3 px-4">Institute</th>
                <th className="py-3 px-4">Gross Sale</th>
                <th className="py-3 px-4">Platform Fee</th>
                <th className="py-3 px-4">Teacher Payout</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono">
                    <p className="font-bold text-slate-900">{r.orderId}</p>
                    <span className="text-[10px] text-slate-400">{r.gatewayTransferId}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{r.tenantName}</p>
                    <span className="text-[10px] text-slate-400">{r.timestamp}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">₹ {r.grossAmount}</td>
                  <td className="py-3.5 px-4 font-bold text-indigo-700">
                    ₹ {r.platformFeeAmount} ({r.platformFeePercent}%)
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">₹ {r.netPayoutAmount}</td>
                  <td className="py-3.5 px-4">
                    {r.status === 'settled' && <Badge variant="success" size="sm">Settled</Badge>}
                    {r.status === 'pending' && <Badge variant="warning" size="sm">Escrow Pending</Badge>}
                    {r.status === 'failed' && <Badge variant="danger" size="sm">Failed Transfer</Badge>}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {r.status === 'failed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetryTransfer(r.id)}
                        className="text-[11px] py-1 px-2.5 text-rose-600 border-rose-300 hover:bg-rose-50 font-bold gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </Button>
                    )}
                    {r.status === 'settled' && (
                      <span className="text-[11px] text-slate-400 font-mono">Completed</span>
                    )}
                    {r.status === 'pending' && (
                      <span className="text-[11px] text-amber-600 font-medium">In Settlement</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

