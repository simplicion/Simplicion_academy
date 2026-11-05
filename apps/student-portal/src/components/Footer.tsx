'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Phone, ShieldCheck, FileText } from 'lucide-react';

export interface FooterProps {
  tenantName: string;
  tagline: string;
  whatsappNumber?: string;
  supportPhone?: string;
}

export const Footer: React.FC<FooterProps> = ({
  tenantName,
  tagline,
  whatsappNumber = '919876543210',
  supportPhone = '+91 98765 43210',
}) => {
  const defaultWhatsAppText = encodeURIComponent(
    `Hi sir, I am interested in joining the CUET UG 2027 Batch at ${tenantName}. Please guide me.`
  );
  const waUrl = `https://wa.me/${whatsappNumber}?text=${defaultWhatsAppText}`;

  return (
    <>
      {/* Floating WhatsApp Action Button (PRD FR-STUDIO-3 & FR-MOD Community) */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-full shadow-lg transition-transform hover:scale-105 select-none"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs sm:text-sm">Chat with Us</span>
      </a>

      {/* Main Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2 space-y-3">
              <span className="text-lg font-bold text-white tracking-tight">{tenantName}</span>
              <p className="text-xs text-slate-400 italic">&ldquo;{tagline}&rdquo;</p>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Dedicated learning portal delivering NCERT foundations, bilingual live classes, and
                NTA-pattern CBT mock tests.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Admissions &amp; Support</h4>
              <p className="text-xs flex items-center text-slate-400">
                <Phone className="w-3.5 h-3.5 mr-2 text-[var(--brand-primary,#2563eb)]" />
                <span>{supportPhone}</span>
              </p>
              <p className="text-xs flex items-center text-slate-400">
                <MessageCircle className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                <span>WhatsApp: +{whatsappNumber}</span>
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Legal &amp; Compliance</h4>
              <ul className="text-xs space-y-1.5 text-slate-400">
                <li>
                  <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy (DPDP)</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer transition-colors">Refund &amp; Cancellation Policy</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>© {new Date().getFullYear()} {tenantName}. All rights reserved.</p>
            <p className="mt-2 sm:mt-0 flex items-center space-x-1">
              <span>Powered by</span>
              <span className="font-semibold text-slate-400">Simplicion Academy OS</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

