'use client';

import React, { useState, useEffect } from 'react';

export interface ImpersonationBannerProps {
  impersonated?: boolean;
  ticketId?: string;
  adminId?: string;
  reason?: string;
  onExit?: () => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({
  impersonated: initialImpersonated,
  ticketId: initialTicketId,
  adminId: initialAdminId,
  reason: initialReason,
  onExit,
}) => {
  const [isImpersonated, setIsImpersonated] = useState(initialImpersonated ?? false);
  const [ticketId, setTicketId] = useState(initialTicketId || 'TCK-2026-8819');
  const [adminId, setAdminId] = useState(initialAdminId || 'sec_superadmin_01');
  const [reason, setReason] = useState(initialReason || 'Investigating live question bank layout sync issue');
  const [timeRemaining, setTimeRemaining] = useState(895); // 15 mins (895s) countdown

  useEffect(() => {
    // Check search params or sessionStorage if in browser
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const impParam = urlParams.get('impersonated');
      const ticketParam = urlParams.get('ticketId');
      const adminParam = urlParams.get('adminId');
      const reasonParam = urlParams.get('reason');

      if (impParam === 'true') {
        setIsImpersonated(true);
        if (ticketParam) setTicketId(ticketParam);
        if (adminParam) setAdminId(adminParam);
        if (reasonParam) setReason(reasonParam);
      } else if (sessionStorage.getItem('simplicion_impersonation_active') === 'true') {
        setIsImpersonated(true);
        const storedTicket = sessionStorage.getItem('simplicion_impersonation_ticket');
        if (storedTicket) setTicketId(storedTicket);
      }
    }
  }, []);

  useEffect(() => {
    if (!isImpersonated) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleExit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isImpersonated]);

  const handleExit = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('simplicion_impersonation_active');
      sessionStorage.removeItem('simplicion_impersonation_ticket');
      if (onExit) {
        onExit();
      } else {
        window.location.href = 'http://localhost:3003/audit';
      }
    }
  };

  if (!isImpersonated) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div
      data-testid="impersonation-security-banner"
      role="alert"
      className="sticky top-0 z-50 bg-amber-500 text-slate-950 px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 font-medium text-xs lg:text-sm border-b border-amber-600"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" />
        <span className="font-bold tracking-wide uppercase bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-xs">
          Audited Impersonation Mode
        </span>
        <span className="truncate">
          Operating as Tenant Administrator for Ticket <strong className="underline">{ticketId}</strong> ({reason}) by Admin <code className="bg-amber-600/30 px-1 py-0.5 rounded text-xs">{adminId}</code>.
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="bg-amber-400/60 px-2 py-1 rounded text-xs font-mono font-semibold">
          TTL: {formattedTime}
        </span>
        <button
          type="button"
          onClick={handleExit}
          data-testid="exit-impersonation-btn"
          className="bg-slate-950 hover:bg-slate-900 text-amber-300 hover:text-white px-3 py-1 rounded text-xs font-semibold shadow-sm transition flex items-center gap-1"
        >
          Exit Session & Return to Admin
        </button>
      </div>
    </div>
  );
};

