'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Tabs, Badge } from '@simplicion/ui';
import {
  Video,
  FileText,
  Trophy,
  BookOpen,
  ChevronLeft,
  Sparkles,
  Download,
} from 'lucide-react';
import { VideoPlayer } from '../../../../../components/VideoPlayer';
import { WatermarkedDocumentViewer } from '../../../../../components/WatermarkedDocumentViewer';
import { loadReferenceTenant } from '../../../../../lib/tenant-data';

interface PageProps {
  params: { offeringId: string; unitId: string };
}

export default function UnitContentViewerPage({ params }: PageProps) {
  const { tenant, offerings } = loadReferenceTenant();
  const offering = offerings.find((o) => o.id === params.offeringId) || offerings[0];
  const json = offering.toJSON();
  const currentUnit = json.units.find((u) => u.slug === params.unitId) || json.units[0];

  const [activeTab, setActiveTab] = useState('classes');

  const tabs = [
    { id: 'classes', label: 'Live & Recorded Classes', icon: <Video className="w-4 h-4" />, badge: 3 },
    { id: 'notes', label: 'Study Notes & Mindmaps', icon: <FileText className="w-4 h-4" />, badge: 2 },
    { id: 'mocks', label: 'CBT Mocks & Quizzes', icon: <Trophy className="w-4 h-4" />, badge: 2 },
    { id: 'pyqs', label: 'Solved PYQs (2022-2026)', icon: <BookOpen className="w-4 h-4" />, badge: 1 },
  ];

  // Mock sample pages for the watermarked PDF notes reader
  const sampleNotePages = [
    `<h3>Chapter 1: The Cold War Era &amp; Non-Aligned Movement</h3>
     <p>The Cold War refers to the competition, the tensions, and a series of confrontations between the United States and Soviet Union, backed by their respective allies.</p>
     <p><strong>Key Arenas of Cold War:</strong></p>
     <ul>
       <li>Korean Crisis (1950 - 1953)</li>
       <li>Berlin Wall Crisis (1958 - 1962)</li>
       <li>Cuban Missile Crisis (1962)</li>
     </ul>
     <p>The Non-Aligned Movement (NAM) was co-founded by Jawaharlal Nehru (India), Josip Broz Tito (Yugoslavia), Gamal Abdel Nasser (Egypt), Sukarno (Indonesia), and Kwame Nkrumah (Ghana).</p>`,
    `<h3>NAM Principles &amp; Indian Foreign Policy</h3>
     <p>Non-alignment was not a policy of 'fleeing away' or remaining neutral. India was in favor of actively intervening in world affairs to soften Cold War rivalries.</p>
     <p><strong>Core Tenets of Panchsheel (1954):</strong></p>
     <ol>
       <li>Mutual respect for each other's territorial integrity and sovereignty.</li>
       <li>Mutual non-aggression.</li>
       <li>Mutual non-interference in each other's internal affairs.</li>
       <li>Equality and mutual benefit.</li>
       <li>Peaceful co-existence.</li>
     </ol>`,
  ];

  return (
    <div className="py-10 bg-slate-50/60 dark:bg-slate-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href={`/study/${offering.id}`}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[var(--brand-primary,#2563eb)] mb-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Back to {offering.title}</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary,#2563eb)]">
                Subject Unit
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {currentUnit?.name || 'Unit Study Workspace'}
              </h1>
            </div>

            <Link href={`/study/${offering.id}/cbt/test-sunday-01`}>
              <Button variant="danger" size="sm">
                <Trophy className="w-4 h-4 mr-1.5" />
                <span>Launch Unit CBT Mock</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Content Navigation Tabs */}
        <Card padding="none" className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="px-4" />
        </Card>

        {/* Tab 1: Video Classes */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <VideoPlayer
              title={`${currentUnit?.name}: Masterclass Lecture 1 — Core Thematic Analysis`}
              durationMinutes={45}
            />
          </div>
        )}

        {/* Tab 2: Study Notes with Dynamic Anti-Piracy Watermarking */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <WatermarkedDocumentViewer
              documentTitle={`${currentUnit?.name} — Chapter-wise Comprehensive Handwritten Notes`}
              documentPages={sampleNotePages}
              studentName="Rahul Sharma"
              studentPhone="+91 98765 43210"
              allowDownload={false}
            />
          </div>
        )}

        {/* Tab 3: CBT Mocks */}
        {activeTab === 'mocks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card padding="md" className="border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <Badge variant="success" size="sm" className="mb-2">NTA Pattern</Badge>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Sunday Full-Length CBT Mock Test 1
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  50 Questions • 60 Minutes • +4 / -1 Marking
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Link href={`/study/${offering.id}/cbt/test-sunday-01`}>
                  <Button variant="primary" size="sm" className="w-full">
                    <span>Start Test Simulator</span>
                    <Trophy className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card padding="md" className="border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <Badge variant="primary" size="sm" className="mb-2">Chapter Quiz</Badge>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Chapter 1 Quick Revision Practice Quiz
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  15 Questions • 20 Minutes • Instant Solutions
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Link href={`/study/${offering.id}/cbt/test-sunday-01`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <span>Start Quiz</span>
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 4: PYQs */}
        {activeTab === 'pyqs' && (
          <Card padding="lg" className="border-slate-200 dark:border-slate-800 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-[var(--brand-primary,#2563eb)] mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Previous Year Questions (2022 to 2026 Solved)
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All official NTA CUET question papers with detailed answer rationales and NCERT page citations.
            </p>
            <Button variant="primary" size="sm" className="mt-2">
              <Download className="w-4 h-4 mr-1.5" />
              <span>Download Solved PYQ Compilation (PDF)</span>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

