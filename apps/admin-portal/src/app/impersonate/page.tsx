'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@simplicion/ui';
import {
  ShieldAlert,
  KeyRound,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
} from 'lucide-react';
import {
  ImpersonationSessionModal,
  ImpersonationLog,
} from '../../components/impersonation/ImpersonationSessionModal';

const AVAILABLE_TENANTS = [
  { id: 'tenant_cuet', name: 'Humanities CUET Academy', slug: 'cuet-humanities' },
  { id: 'tenant_apex_neet', name: 'Apex NEET & Medical Academy', slug: 'apex-neet' },
  { id: 'tenant_commerce_hub', name: 'Commerce Catalyst CA Foundation', slug: 'commerce-catalyst' },
];

const INITIAL_LOGS: ImpersonationLog[] = [
  {
    id: 'imp_1793881234',
    adminId: 'admin_master_01',
    tenantId: 'tenant_cuet',
    tenantName: 'Humanities CUET Academy',
    ticketId: 'SUP-9821',
    reason: 'Investigating payment webhook transfer mismatch for Foundation Batch enrollment.',
    timestamp: '2026-11-05T14:30:00Z',
    expiresInMinutes: 15,
  },
  {
    id: 'imp_1793880912',
    adminId: 'admin_master_01',
    tenantId: 'tenant_apex_neet',
    ticketId: 'SUP-9804',
    reason: 'Assisting educator with bulk CSV question bank formatting error.',
    timestamp: '2026-11-04T11:15:00Z',
    expiresInMinutes: 15,
  },
];

export default function AuditedImpersonationConsolePage() {
  const [logs, setLogs] = useState<ImpersonationLog[]>(INITIAL_LOGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<ImpersonationLog | null>(null);

  const handleLaunchSession = (log: ImpersonationLog) => {
    setLogs([log, ...logs]);
    setActiveSession(log);
  };

  const handleTerminateSession = () => {
    setActiveSession(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Audited Impersonation Console (SAFS-02)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access teacher portals strictly for authorized support investigations with immutable cryptographic audit logging.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5 text-xs"
        >
          <KeyRound className="w-4 h-4" />
          <span>New Impersonation Session</span>
        </Button>
      </div>

      {/* Active Session Banner if Running */}
      {activeSession && (
        <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-400 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
            <div>
              <p className="text-xs font-bold text-amber-950">
                ACTIVE IMPERSONATION SESSION: {activeSession.tenantName}
              </p>
              <p className="text-[11px] text-amber-800 font-mono">
                Session ID: {activeSession.id} • Reason: "{activeSession.reason}"
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center space-x-1"
            >
              <span>Open Studio Session</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTerminateSession}
              className="text-xs text-amber-950 border-amber-400 hover:bg-amber-100 font-bold"
            >
              Terminate
            </Button>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
            <History className="w-4 h-4 text-indigo-600" />
            <span>Immutable Impersonation Audit Log</span>
          </h3>
          <span className="text-xs text-slate-500">{logs.length} logged sessions</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Audit Session ID</th>
                  <th className="py-3 px-4">Tenant Target</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Support Ticket</th>
                  <th className="py-3 px-4">Mandatory Justification</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{log.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{log.tenantName}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{log.adminId}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {log.ticketId ? (
                        <Badge variant="outline" size="sm">
                          {log.ticketId}
                        </Badge>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-sm">
                      <p className="line-clamp-2">{log.reason}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Session Modal */}
      <ImpersonationSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLaunch={handleLaunchSession}
        tenants={AVAILABLE_TENANTS}
      />
    </div>
  );
}

