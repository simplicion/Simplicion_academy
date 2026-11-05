'use client';

import React, { useState } from 'react';
import { Modal, Button, Badge } from '@simplicion/ui';
import { ShieldAlert, KeyRound, Clock, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';

export interface ImpersonationLog {
  id: string;
  adminId: string;
  tenantId: string;
  tenantName: string;
  reason: string;
  ticketId?: string;
  timestamp: string;
  expiresInMinutes: number;
}

export interface ImpersonationSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (log: ImpersonationLog) => void;
  tenants: Array<{ id: string; name: string; slug: string }>;
}

export const ImpersonationSessionModal: React.FC<ImpersonationSessionModalProps> = ({
  isOpen,
  onClose,
  onLaunch,
  tenants,
}) => {
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id || '');
  const [ticketId, setTicketId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A comprehensive operational justification is required by SAFS-02.');
      return;
    }
    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters long explaining the support case.');
      return;
    }

    const targetTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];

    const log: ImpersonationLog = {
      id: `imp_${Date.now()}`,
      adminId: 'admin_master_01',
      tenantId: targetTenant.id,
      tenantName: targetTenant.name,
      reason: reason.trim(),
      ticketId: ticketId.trim() || undefined,
      timestamp: new Date().toISOString(),
      expiresInMinutes: 15,
    };

    onLaunch(log);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Initiate Audited Impersonation Session">
      <form onSubmit={handleStartSession} className="space-y-4">
        {/* Security Warning Notice */}
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start space-x-3 text-xs text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">SAFS-02 Cryptographic Audit Protocol:</p>
            <p className="leading-relaxed">
              Impersonation grants temporary access to the tenant's Teacher Studio. All mutations, document views, and grade modifications will be logged with your Admin Identity and IP address.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center space-x-2 text-xs text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tenant Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">Target Institute Tenant *</label>
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.slug}.simplicion.app)
              </option>
            ))}
          </select>
        </div>

        {/* Support Ticket ID */}
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">
            Support Ticket / Reference ID (Optional)
          </label>
          <input
            type="text"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            placeholder="e.g. SUP-2026-9812"
            className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>

        {/* Mandatory Justification */}
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">
            Justification & Case Details *
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Investigating missing question images reported by student during CUET Mock 1..."
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Session automatically expires in 15 minutes.</span>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Generate Token & Launch</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

