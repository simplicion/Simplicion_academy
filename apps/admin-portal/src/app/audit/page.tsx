'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@simplicion/ui';
import { ClipboardList, Search, ShieldCheck, Download, Filter } from 'lucide-react';

export interface AuditEventRecord {
  id: string;
  timestamp: string;
  category: 'TENANT_APPROVAL' | 'TENANT_SUSPENSION' | 'IMPERSONATION' | 'PAYOUT_RETRY';
  actor: string;
  targetEntity: string;
  ipAddress: string;
  details: string;
}

const INITIAL_AUDIT_LOGS: AuditEventRecord[] = [
  {
    id: 'aud_9841',
    timestamp: '05 Nov 2026, 17:30',
    category: 'IMPERSONATION',
    actor: 'admin_master_01',
    targetEntity: 'tenant_cuet (Humanities CUET Academy)',
    ipAddress: '103.21.244.12',
    details: 'Initiated 15-minute support session for batch transfer mismatch.',
  },
  {
    id: 'aud_9840',
    timestamp: '05 Nov 2026, 16:15',
    category: 'TENANT_APPROVAL',
    actor: 'admin_master_01',
    targetEntity: 'tenant_apex_neet (Apex NEET Academy)',
    ipAddress: '103.21.244.12',
    details: 'Approved onboarding application and verified PAN + GSTIN documents.',
  },
  {
    id: 'aud_9839',
    timestamp: '05 Nov 2026, 15:02',
    category: 'PAYOUT_RETRY',
    actor: 'admin_master_01',
    targetEntity: 'order_comm_302',
    ipAddress: '103.21.244.12',
    details: 'Re-triggered failed settlement transfer to teacher bank account.',
  },
  {
    id: 'aud_9838',
    timestamp: '28 Oct 2026, 19:40',
    category: 'TENANT_SUSPENSION',
    actor: 'admin_master_01',
    targetEntity: 'tenant_test_bad (FastTrack Test Series)',
    ipAddress: '103.21.244.12',
    details: 'Suspended institute due to DMCA copyright infringement notice.',
  },
];

export default function SystemAuditLogsPage() {
  const [logs, setLogs] = useState<AuditEventRecord[]>(INITIAL_AUDIT_LOGS);
  const [search, setSearch] = useState('');

  const filtered = logs.filter(
    (l) =>
      l.targetEntity.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">System Audit Logs</h2>
          <p className="text-xs text-slate-500 mt-1">
            Immutable regulatory and compliance record of all Super Admin actions across the multi-tenant fleet.
          </p>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
          <Download className="w-3.5 h-3.5" />
          <span>Export Compliance Audit (JSON)</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit records by entity or keyword..."
            className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {filtered.length} of {logs.length} Audit Events
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Actor & IP</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{log.id}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                      {log.category}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{log.targetEntity}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-mono text-slate-700">{log.actor}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{log.ipAddress}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                    <p className="line-clamp-2">{log.details}</p>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                    {log.timestamp}
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

