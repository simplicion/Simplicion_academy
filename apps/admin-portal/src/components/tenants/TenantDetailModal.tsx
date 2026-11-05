'use client';

import React, { useState } from 'react';
import { Modal, Button, Badge } from '@simplicion/ui';
import {
  Building2,
  CheckCircle,
  AlertTriangle,
  Globe,
  CreditCard,
  FileCheck,
  ShieldAlert,
  User,
  Calendar,
} from 'lucide-react';

export interface AdminTenantItem {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  status: 'draft' | 'active' | 'suspended';
  planId: 'plan_starter' | 'plan_pro' | 'plan_enterprise';
  planName: string;
  customDomain?: string;
  studentsCount: number;
  panNumber: string;
  bankAccount: string;
  ifsc: string;
  createdAt: string;
  suspensionReason?: string;
}

export interface TenantDetailModalProps {
  tenant: AdminTenantItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onSuspend: (id: string, reason: string) => void;
  onReactivate: (id: string) => void;
}

export const TenantDetailModal: React.FC<TenantDetailModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onApprove,
  onSuspend,
  onReactivate,
}) => {
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendInput, setShowSuspendInput] = useState(false);

  if (!tenant) return null;

  const handleConfirmSuspend = () => {
    if (!suspendReason.trim()) {
      alert('A valid operational reason is required to suspend a tenant.');
      return;
    }
    onSuspend(tenant.id, suspendReason.trim());
    setShowSuspendInput(false);
    setSuspendReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tenant Governance: ${tenant.name}`}>
      <div className="space-y-5 max-h-[75vh] overflow-y-auto px-1">
        {/* Status Header */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <h4 className="text-sm font-bold text-slate-900">{tenant.name}</h4>
            <span className="text-xs font-mono text-slate-500">
              Subdomain: https://{tenant.slug}.simplicion.app
            </span>
          </div>
          <div>
            {tenant.status === 'active' && <Badge variant="success" size="md">Active & Published</Badge>}
            {tenant.status === 'draft' && <Badge variant="warning" size="md">Pending Approval</Badge>}
            {tenant.status === 'suspended' && <Badge variant="danger" size="md">Suspended</Badge>}
          </div>
        </div>

        {/* Suspension Alert if applicable */}
        {tenant.status === 'suspended' && tenant.suspensionReason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Suspension Notice:</p>
              <p>{tenant.suspensionReason}</p>
            </div>
          </div>
        )}

        {/* Educator & Identity Details */}
        <div className="space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Educator Owner Details</h5>
          <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-white border border-slate-200 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-400 block">Name</span>
              <span className="font-semibold text-slate-800">{tenant.ownerName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Email</span>
              <span className="font-semibold text-slate-800">{tenant.ownerEmail}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Mobile Number</span>
              <span className="font-semibold text-slate-800">{tenant.ownerPhone}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Current SaaS Tier</span>
              <span className="font-bold text-indigo-600">{tenant.planName}</span>
            </div>
          </div>
        </div>

        {/* KYC & Financial Verification */}
        <div className="space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">KYC & Settlement Account</h5>
          <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-white border border-slate-200 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-400 block">PAN Card Number</span>
              <span className="font-mono font-bold text-slate-800">{tenant.panNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Razorpay Route Linked A/C</span>
              <span className="font-mono text-slate-800">{tenant.bankAccount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Bank IFSC Code</span>
              <span className="font-mono text-slate-800">{tenant.ifsc}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Custom Domain</span>
              <span className="font-semibold text-slate-800">{tenant.customDomain || 'None (Shared)'}</span>
            </div>
          </div>
        </div>

        {/* Suspension Reason Input Form */}
        {showSuspendInput && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
            <label className="text-xs font-bold text-red-900 block">
              Mandatory Suspension Reason (Audit Logged) *
            </label>
            <textarea
              rows={2}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. Terms violation, fraudulent batch offering, or chargeback dispute..."
              className="w-full text-xs p-2.5 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500/20"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" size="sm" onClick={() => setShowSuspendInput(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmSuspend}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Confirm Suspension
              </Button>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center space-x-2">
            {tenant.status === 'draft' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onApprove(tenant.id);
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Approve & Publish Tenant
              </Button>
            )}

            {tenant.status === 'active' && !showSuspendInput && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSuspendInput(true)}
                className="border-red-300 text-red-600 hover:bg-red-50 font-bold"
              >
                Suspend Tenant
              </Button>
            )}

            {tenant.status === 'suspended' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onReactivate(tenant.id);
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Reactivate Tenant
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

