'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@simplicion/ui';
import {
  Layers,
  ArrowRight,
  BookOpen,
  MessageCircle,
  Trophy,
  FileText,
  Video,
  ChevronLeft,
} from 'lucide-react';
import { loadReferenceTenant } from '../../../lib/tenant-data';

interface PageProps {
  params: { offeringId: string };
}

export default function OfferingStudyHubPage({ params }: PageProps) {
  const { tenant, offerings } = loadReferenceTenant();
  const offering = offerings.find((o) => o.id === params.offeringId) || offerings[0];
  const json = offering.toJSON();

  // WhatsApp group invite with pre-filled message according to PRD FR-MOD Community
  const student = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('simplicion_student') || '{}') : {};
  const studentName = student.name || 'Student';
  const waText = encodeURIComponent(
    `Hi sir, my name is ${studentName}. I recently joined the ${json.title} batch. Please add me to the group.`
  );
  const waUrl = `https://wa.me/${tenant.settings.contact.whatsappNumber || '919876543210'}?text=${waText}`;

  return (
    <div className="py-12 bg-slate-50/60 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back navigation & Batch Title */}
        <div>
          <Link
            href="/study"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[var(--brand-primary,#2563eb)] mb-3"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Back to All Enrolled Batches</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {json.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Select a subject unit below to access classes, chapter-wise notes, and CBT test series.
              </p>
            </div>

            <Link href={`/study/${json.id}/cbt/test-sunday-01`}>
              <Button variant="danger" size="md" className="shadow-md">
                <Trophy className="w-4 h-4 mr-2" />
                <span>Launch Sunday CBT Mock</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* WhatsApp Community Card (PRD FR-MOD Community) */}
        <Card padding="md" className="border-2 border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-full bg-emerald-500 text-white flex-shrink-0">
              <MessageCircle className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Join {json.title} WhatsApp Group
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Direct access to daily class links, faculty doubt discussions, and peer study rooms.
              </p>
            </div>
          </div>

          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500">
              <span>Join WhatsApp Group</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </a>
        </Card>

        {/* Subjects & Units List ("Let's Study" Header from PRD Section 9) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-[var(--brand-primary,#2563eb)]" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {tenant.settings.labels.unitsHeader}
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">{json.units.length} Core Subjects</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {json.units.map((unit, idx) => (
              <Link key={unit.id} href={`/study/${json.id}/u/${unit.slug}`}>
                <Card hoverable padding="lg" className="h-full flex flex-col justify-between border-slate-200 dark:border-slate-800">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-[var(--brand-primary,#2563eb)] font-bold text-sm flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <Badge variant="primary" size="sm">7 Modules</Badge>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {unit.name}
                    </h3>

                    <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center space-x-1">
                        <Video className="w-3.5 h-3.5" />
                        <span>18 Classes</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>12 Notes</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>5 Mocks</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-[var(--brand-primary,#2563eb)]">
                    <span>Enter Subject Units</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

