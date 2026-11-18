'use client';

import React from 'react';
import { Clock, Mail, Phone, MessageCircle, RefreshCw, GraduationCap } from 'lucide-react';

export interface PortalUnavailableViewProps {
  academyName: string;
  logoUrl?: string;
  message?: string;
  supportEmail?: string;
  supportPhone?: string;
  whatsappNumber?: string;
  onRetry?: () => void;
}

export const PortalUnavailableView: React.FC<PortalUnavailableViewProps> = ({
  academyName,
  logoUrl,
  message,
  supportEmail,
  supportPhone,
  whatsappNumber,
  onRetry,
}) => {
  const displayMessage =
    message?.trim() ||
    'This academy portal is temporarily unavailable while the educator updates courses and study material. Please check back soon!';

  const cleanWhatsapp = whatsappNumber ? whatsappNumber.replace(/[^0-9]/g, '') : '';

  return (
    <div
      data-testid="portal-unavailable-view"
      className="min-h-[82vh] bg-[#f8fafc] flex items-center justify-center px-4 py-12"
    >
      <div className="max-w-lg w-full bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-8 sm:p-10 text-center space-y-6 animate-fade-in">
        {/* Academy Brand Mark */}
        <div className="flex flex-col items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={academyName}
              className="w-14 h-14 rounded-2xl object-cover border border-[#e2e8f0] shadow-xs"
            />
          ) : (
            <img
              src="/logo-black.svg"
              alt={academyName}
              className="w-12 h-12 object-contain"
            />
          )}

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
            <Clock className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Academy Temporarily Offline</span>
          </span>
        </div>

        {/* Friendly Headline & Message */}
        <div className="space-y-2.5">
          <h1
            className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            {academyName} is not available right now
          </h1>
          <p className="text-sm text-[#475569] leading-relaxed">{displayMessage}</p>
        </div>

        {/* Helpful Contact Options if configured */}
        {(supportEmail || supportPhone || cleanWhatsapp) && (
          <div className="pt-4 border-t border-[#f1f5f9] space-y-2.5">
            <p className="text-xs font-semibold text-[#64748b]">
              Need urgent help? Reach out to the academy team:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {supportEmail && (
                <a
                  href={`mailto:${supportEmail}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#334155] bg-[#f8fafc] hover:bg-[#eff6ff] hover:text-[#2563eb] border border-[#e2e8f0] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{supportEmail}</span>
                </a>
              )}
              {supportPhone && (
                <a
                  href={`tel:${supportPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#334155] bg-[#f8fafc] hover:bg-[#eff6ff] hover:text-[#2563eb] border border-[#e2e8f0] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{supportPhone}</span>
                </a>
              )}
              {cleanWhatsapp && (
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#047857] bg-[#ecfdf5] hover:bg-[#d1fae5] border border-[#a7f3d0] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Support</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Retry / Check Again */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => (onRetry ? onRetry() : window.location.reload())}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white shadow-sm hover:opacity-95 transition"
            style={{ backgroundColor: 'var(--brand-primary, #2563eb)' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
