"use client";

import { Award, ChevronLeft, ShieldCheck, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { USER_VERIFIED_BADGES } from "@/app/(pitchin)/profile/data/badges";

export default function CertificatesPage() {
  const certificates = USER_VERIFIED_BADGES.filter(b => b.category === "certificate");

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 pb-20">
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-4 pb-3 space-y-3">
          <div className="flex items-center gap-3">
            <Link 
              href="/profile/me?tab=badges" 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                My Certificates
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                View and manage your verified credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-6 pb-28 space-y-6">
        {certificates.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
            <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No certificates yet</p>
            <p className="text-xs text-gray-500 mb-4">Complete academy courses to earn verified certificates.</p>
            <Link href="/academy" className="inline-flex items-center text-xs font-bold bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
              Browse Academy
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map(cert => (
              <div
                key={cert.id}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/80 dark:to-purple-950/80 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                          {cert.title}
                        </h3>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                          Issued by {cert.issuer}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {cert.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {cert.proofPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{point.title}: </span>
                          <span className="text-gray-500 dark:text-gray-400">{point.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    Issued {cert.issuedAt}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full transition-colors">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 rounded-lg text-xs font-bold transition-colors">
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
