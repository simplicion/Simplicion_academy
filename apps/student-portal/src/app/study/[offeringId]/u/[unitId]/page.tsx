'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@simplicion/ui';
import {
  Video,
  FileText,
  Trophy,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Play,
  Clock,
  Sparkles,
  Download,
  MessageCircle,
  ArrowRight,
  BookCheck,
  HelpCircle,
  Layers,
  Link as LinkIcon,
  Check,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import clsx from 'clsx';
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

  // Active menu / tab on the right side
  const [activeTab, setActiveTab] = useState<'classes' | 'notes' | 'mocks' | 'pyqs'>('classes');

  // Left side view: video player or document reader
  const [activeView, setActiveView] = useState<'video' | 'notes'>('video');

  // Selected lecture from the right side playlist
  const [selectedLectureId, setSelectedLectureId] = useState('lec-1');

  // Track completed lectures
  const [completedLectures, setCompletedLectures] = useState<string[]>(['lec-1']);

  // Selected sub-tab under video (Overview / Chapters / Resources)
  const [videoSubTab, setVideoSubTab] = useState<'overview' | 'chapters' | 'resources'>('overview');

  // Custom Video Link modal / quick tester
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [customInputUrl, setCustomInputUrl] = useState('');
  const [customUrlSaved, setCustomUrlSaved] = useState(false);

  // Initial lectures list with YouTube video links
  const [lectures, setLectures] = useState([
    {
      id: 'lec-1',
      number: 1,
      title: `${currentUnit?.name}: Masterclass Lecture 1 — Core Thematic Analysis`,
      shortTitle: 'Lecture 1: Core Thematic Analysis & Foundation',
      videoUrl: 'https://www.youtube.com/watch?v=kQT2aP_79Yk',
      durationMinutes: 45,
      durationLabel: '45 mins',
      date: 'Live Recorded • Session 1',
      chapters: [
        { timeSeconds: 0, title: 'Introduction & Core Concepts' },
        { timeSeconds: 900, title: 'Key Thinkers & Historical Milestones' },
        { timeSeconds: 1800, title: 'Critical Examination MCQs' },
      ],
      description:
        'Comprehensive line-by-line NCERT breakdown focusing on high-yield themes, foundational conceptual understanding, and NTA CUET target syllabus coverage.',
      keyPoints: [
        'NCERT chapter line-by-line critical analysis',
        'High-yield concepts repeated across 2022-2025 CUET papers',
        'Standard conceptual terminology and keyword mapping',
        'Exam-focused elimination strategies for confusing options',
      ],
    },
    {
      id: 'lec-2',
      number: 2,
      title: `${currentUnit?.name}: Masterclass Lecture 2 — Reading Comprehension & Tactics`,
      shortTitle: 'Lecture 2: Advanced Analysis & Tactics',
      videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      durationMinutes: 52,
      durationLabel: '52 mins',
      date: 'Live Recorded • Session 2',
      chapters: [
        { timeSeconds: 0, title: 'Contextual In-depth Analysis' },
        { timeSeconds: 1200, title: 'Passage & Assertion-Reason Drills' },
        { timeSeconds: 2400, title: 'NTA Scoring Traps & Elimination' },
      ],
      description:
        'Master assertion-reason questions, match-the-following, and chronological questions with specialized elimination shortcuts for 100 percentile North Campus target.',
      keyPoints: [
        'Assertion-Reasoning question pattern decoder',
        'Speed reading and keyword anchoring in unseen extracts',
        'Chronology and date-matching memory techniques',
        'Avoiding negative marking traps set by NTA question setters',
      ],
    },
    {
      id: 'lec-3',
      number: 3,
      title: `${currentUnit?.name}: Masterclass Lecture 3 — Verbal Ability & Speed Drills`,
      shortTitle: 'Lecture 3: Rapid Revision & Speed Drills',
      videoUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
      durationMinutes: 40,
      durationLabel: '40 mins',
      date: 'Live Recorded • Session 3',
      chapters: [
        { timeSeconds: 0, title: 'Full Unit Formula & Mindmap Walkthrough' },
        { timeSeconds: 1000, title: 'Rapid Fire 30-Second MCQs' },
        { timeSeconds: 2000, title: 'Doubt Clearance & Strategy Roadmap' },
      ],
      description:
        'High-speed timed drills covering full unit revision, rapid 30-second MCQs, and complete doubt resolution roadmap.',
      keyPoints: [
        'Complete unit mindmap and formula recall in 20 minutes',
        'Rapid fire 30-second question timer practice',
        'Live doubt clearance and high-probability predicted questions',
        'Final revision checklist for unit CBT mock',
      ],
    },
  ]);

  const currentLecture = lectures.find((l) => l.id === selectedLectureId) || lectures[0];

  // Mock study notes
  const studyNotes = [
    {
      id: 'note-1',
      title: `${currentUnit?.name} — Chapter-wise Comprehensive Handwritten Notes`,
      pages: 14,
      readTime: '25 min read',
      badge: 'NCERT Verified',
      description: 'High-yield handwritten summary with diagrams, memory mnemonics, and NCERT line citations.',
    },
    {
      id: 'note-2',
      title: `${currentUnit?.name} — Rapid Revision Mindmap & Formula Cheat Sheet`,
      pages: 6,
      readTime: '10 min read',
      badge: 'Formula Sheet',
      description: 'Compact visual mindmap linking all key concepts, dates, and constitutional articles in one sheet.',
    },
  ];

  // Mock sample pages for watermarked viewer
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

  // Navigation handlers
  const handleLectureSelect = (lectureId: string) => {
    setSelectedLectureId(lectureId);
    setActiveView('video');
  };

  const handleNextLecture = () => {
    const currentIndex = lectures.findIndex((l) => l.id === currentLecture.id);
    if (currentIndex < lectures.length - 1) {
      setSelectedLectureId(lectures[currentIndex + 1].id);
      setActiveView('video');
    }
  };

  const handlePrevLecture = () => {
    const currentIndex = lectures.findIndex((l) => l.id === currentLecture.id);
    if (currentIndex > 0) {
      setSelectedLectureId(lectures[currentIndex - 1].id);
      setActiveView('video');
    }
  };

  const toggleLectureCompleted = (lectureId: string) => {
    setCompletedLectures((prev) =>
      prev.includes(lectureId) ? prev.filter((id) => id !== lectureId) : [...prev, lectureId]
    );
  };

  // Update current lecture's video URL
  const handleSaveVideoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputUrl.trim()) return;

    setLectures((prev) =>
      prev.map((l) => (l.id === currentLecture.id ? { ...l, videoUrl: customInputUrl.trim() } : l))
    );
    setCustomUrlSaved(true);
    setTimeout(() => {
      setCustomUrlSaved(false);
      setIsUrlModalOpen(false);
    }, 1200);
  };

  // WhatsApp prefilled doubt link
  const student = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('simplicion_student') || '{}') : {};
  const studentName = student.name || 'Rahul Sharma';
  const waDoubtText = encodeURIComponent(
    `Hi sir, I am ${studentName} studying ${currentUnit?.name} in ${offering.title}. I have a doubt in ${currentLecture.shortTitle}.`
  );
  const waDoubtUrl = `https://wa.me/${tenant.settings.contact.whatsappNumber || '919876543210'}?text=${waDoubtText}`;

  // Tab definitions
  const tabs = [
    {
      id: 'classes' as const,
      label: 'Live & Recorded Classes',
      shortLabel: 'Classes',
      icon: <Video className="w-4 h-4" />,
      badge: lectures.length,
    },
    {
      id: 'notes' as const,
      label: 'Study Notes & Mindmaps',
      shortLabel: 'Notes',
      icon: <FileText className="w-4 h-4" />,
      badge: studyNotes.length,
    },
    {
      id: 'mocks' as const,
      label: 'CBT Mocks & Quizzes',
      shortLabel: 'Mocks',
      icon: <Trophy className="w-4 h-4" />,
      badge: 2,
    },
    {
      id: 'pyqs' as const,
      label: 'Solved PYQs (2022-2026)',
      shortLabel: 'PYQs',
      icon: <BookOpen className="w-4 h-4" />,
      badge: 1,
    },
  ];

  return (
    <div className="py-8 bg-slate-50/70 dark:bg-slate-950 min-h-screen">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Navigation & Unit Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <Link
              href={`/study/${offering.id}`}
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[var(--brand-primary,#2563eb)] mb-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Back to {offering.title}</span>
            </Link>

            <div className="flex items-center space-x-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-primary,#2563eb)]">
                  Subject Unit
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{currentUnit?.name || 'Unit Study Workspace'}</span>
                </h1>
              </div>
              <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
                CUET UG 2027
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a href={waDoubtUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400">
                <MessageCircle className="w-4 h-4 mr-1.5" />
                <span>Ask Doubt</span>
              </Button>
            </a>

            <Link href={`/study/${offering.id}/cbt/test-sunday-01`}>
              <Button variant="danger" size="sm" className="shadow-sm">
                <Trophy className="w-4 h-4 mr-1.5" />
                <span>Launch Unit CBT Mock</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 2-Column Split: Left Side Video | Right Side Menus & Options */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
          {/* ======================================================== */}
          {/* LEFT SIDE: Video Player & Lecture Experience              */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {activeView === 'notes' ? (
              // Watermarked Notes Reader View (switched when user selects note on right side)
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-blue-900 dark:text-blue-200">
                    <FileText className="w-4 h-4 text-[var(--brand-primary,#2563eb)]" />
                    <span>Viewing: {studyNotes[0].title}</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveView('video')}
                    className="gap-1.5"
                  >
                    <Video className="w-4 h-4" />
                    <span>Return to Video Lecture</span>
                  </Button>
                </div>

                <WatermarkedDocumentViewer
                  documentTitle={`${currentUnit?.name} — Chapter-wise Comprehensive Handwritten Notes`}
                  documentPages={sampleNotePages}
                  studentName={studentName}
                  studentPhone="+91 98765 43210"
                  allowDownload={false}
                />
              </div>
            ) : (
              // Main Video Player View
              <div className="space-y-5">
                {/* YouTube / Simulated Video Player */}
                <VideoPlayer
                  key={currentLecture.id}
                  title={currentLecture.title}
                  videoUrl={currentLecture.videoUrl}
                  durationMinutes={currentLecture.durationMinutes}
                  chapters={currentLecture.chapters}
                  hideChaptersCard={true}
                  studentName={studentName}
                  studentPhone="+91 98765 43210"
                />

                {/* Lecture Meta & Navigation Controls Bar */}
                <Card padding="md" className="border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <span className="font-bold text-[var(--brand-primary,#2563eb)]">
                          Lecture {currentLecture.number} of {lectures.length}
                        </span>
                        <span>•</span>
                        <span>{currentLecture.durationLabel}</span>
                        <span>•</span>
                        <span className="text-slate-400">{currentLecture.date}</span>
                        <span>•</span>
                        <span className="inline-flex items-center text-emerald-600 font-semibold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 mr-0.5" />
                          <span>YouTube Protected Stream</span>
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        {currentLecture.title}
                      </h2>
                    </div>

                    <div className="flex items-center space-x-2 self-start flex-shrink-0">
                      {/* Teacher / Admin quick link tester */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCustomInputUrl(currentLecture.videoUrl || '');
                          setIsUrlModalOpen(true);
                        }}
                        className="text-xs gap-1 border-slate-300 dark:border-slate-700 hover:border-blue-500"
                        title="Paste or change the YouTube video URL for this lecture"
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-red-500" />
                        <span className="hidden sm:inline">Set YouTube Link</span>
                      </Button>

                      <Button
                        variant={completedLectures.includes(currentLecture.id) ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => toggleLectureCompleted(currentLecture.id)}
                        className={clsx(
                          completedLectures.includes(currentLecture.id) &&
                            'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
                        )}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        <span>{completedLectures.includes(currentLecture.id) ? 'Completed' : 'Mark Done'}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Previous / Next Lecture Steppers */}
                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevLecture}
                      disabled={currentLecture.number === 1}
                      className="gap-1 text-xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Lecture</span>
                    </Button>

                    <div className="flex items-center space-x-2">
                      <Badge variant="primary" size="sm">Bilingual (Hindi + English)</Badge>
                      <Badge variant="secondary" size="sm">NCERT Line-by-Line</Badge>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleNextLecture}
                      disabled={currentLecture.number === lectures.length}
                      className="gap-1 text-xs"
                    >
                      <span>Next Lecture</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Lecture Tabbed Detail Section */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center space-x-4 text-xs font-semibold border-b border-slate-200 dark:border-slate-800 pb-2">
                      <button
                        onClick={() => setVideoSubTab('overview')}
                        className={clsx(
                          'pb-1 transition-colors',
                          videoSubTab === 'overview'
                            ? 'text-[var(--brand-primary,#2563eb)] border-b-2 border-[var(--brand-primary,#2563eb)] font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        )}
                      >
                        Lecture Overview
                      </button>
                      <button
                        onClick={() => setVideoSubTab('chapters')}
                        className={clsx(
                          'pb-1 transition-colors flex items-center space-x-1',
                          videoSubTab === 'chapters'
                            ? 'text-[var(--brand-primary,#2563eb)] border-b-2 border-[var(--brand-primary,#2563eb)] font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        )}
                      >
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>Timestamps &amp; Chapters ({currentLecture.chapters.length})</span>
                      </button>
                      <button
                        onClick={() => setVideoSubTab('resources')}
                        className={clsx(
                          'pb-1 transition-colors flex items-center space-x-1',
                          videoSubTab === 'resources'
                            ? 'text-[var(--brand-primary,#2563eb)] border-b-2 border-[var(--brand-primary,#2563eb)] font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        )}
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        <span>Quick Notes &amp; Drills</span>
                      </button>
                    </div>

                    {/* Sub-tab 1: Overview */}
                    {videoSubTab === 'overview' && (
                      <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                        <p>{currentLecture.description}</p>
                        <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                            High-Yield CUET UG Focus Areas
                          </span>
                          <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400">
                            {currentLecture.keyPoints.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Sub-tab 2: Chapters */}
                    {videoSubTab === 'chapters' && (
                      <div className="space-y-1.5 pt-1">
                        {currentLecture.chapters.map((ch, idx) => {
                          const m = Math.floor(ch.timeSeconds / 60);
                          const s = Math.floor(ch.timeSeconds % 60);
                          const formattedTime = `${m}:${s < 10 ? '0' : ''}${s}`;
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-[var(--brand-primary,#2563eb)] flex items-center justify-center font-bold text-[10px]">
                                  {idx + 1}
                                </span>
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {ch.title}
                                </span>
                              </div>
                              <span className="font-mono text-[11px] text-slate-400 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                                {formattedTime}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Sub-tab 3: Resources */}
                    {videoSubTab === 'resources' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div
                          onClick={() => {
                            setActiveTab('notes');
                            setActiveView('notes');
                          }}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[var(--brand-primary,#2563eb)] cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950 text-[var(--brand-primary,#2563eb)]">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                Chapter Handwritten Notes
                              </h4>
                              <p className="text-[11px] text-slate-500">14 Pages • Anti-Piracy Watermarked</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        <Link href={`/study/${offering.id}/cbt/test-sunday-01`}>
                          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-400 cursor-pointer transition-colors flex items-center justify-between h-full">
                            <div className="flex items-center space-x-2.5">
                              <div className="p-2 rounded-md bg-red-50 dark:bg-red-950 text-red-600">
                                <Trophy className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                  Chapter Practice Quiz
                                </h4>
                                <p className="text-[11px] text-slate-500">15 Questions • Instant Scoring</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* RIGHT SIDE: Menus and Options Sidebar                    */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-6">
            <Card padding="md" className="border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[var(--brand-primary,#2563eb)]" />
                    <span>Unit Content &amp; Modules</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentUnit?.name} • 8 Resources
                  </p>
                </div>
                <Badge variant="success" size="sm">
                  {completedLectures.length}/{lectures.length} Done
                </Badge>
              </div>

              {/* Menus / Tabs Selector (The 4 menus that were previously on top) */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Select Section Menu
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                          'flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all border text-left',
                          isActive
                            ? 'border-[var(--brand-primary,#2563eb)] bg-blue-50/80 dark:bg-blue-950/50 text-[var(--brand-primary,#2563eb)] shadow-xs font-bold'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                        )}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className={clsx(isActive ? 'text-[var(--brand-primary,#2563eb)]' : 'text-slate-500')}>
                            {tab.icon}
                          </span>
                          <span className="truncate">{tab.shortLabel}</span>
                        </div>
                        <span
                          className={clsx(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1.5',
                            isActive
                              ? 'bg-[var(--brand-primary,#2563eb)] text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          )}
                        >
                          {tab.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* The Options for the Selected Menu */}
              <div className="pt-2">
                {/* ---------------------------------------------------- */}
                {/* Option 1: Live & Recorded Classes Playlist           */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'classes' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Lectures in this Unit ({lectures.length})
                      </span>
                      <span className="text-[11px] text-slate-400">Click lecture to play</span>
                    </div>

                    <div className="space-y-2">
                      {lectures.map((lec) => {
                        const isSelected = selectedLectureId === lec.id;
                        const isDone = completedLectures.includes(lec.id);

                        return (
                          <div
                            key={lec.id}
                            onClick={() => handleLectureSelect(lec.id)}
                            className={clsx(
                              'group p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3',
                              isSelected
                                ? 'border-[var(--brand-primary,#2563eb)] bg-blue-50/50 dark:bg-blue-950/30 shadow-xs ring-1 ring-[var(--brand-primary,#2563eb)]/30'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                            )}
                          >
                            {/* Play / Number Icon */}
                            <div
                              className={clsx(
                                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold transition-transform group-hover:scale-105',
                                isSelected
                                  ? 'bg-[var(--brand-primary,#2563eb)] text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              )}
                            >
                              {isSelected ? <Play className="w-3.5 h-3.5 fill-current ml-0.5" /> : lec.number}
                            </div>

                            {/* Lecture details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <h4
                                  className={clsx(
                                    'text-xs font-bold truncate',
                                    isSelected
                                      ? 'text-[var(--brand-primary,#2563eb)]'
                                      : 'text-slate-800 dark:text-slate-200'
                                  )}
                                >
                                  {lec.shortTitle}
                                </h4>
                                {isSelected && (
                                  <Badge variant="primary" size="sm" className="text-[9px] px-1.5 py-0">
                                    Playing
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{lec.durationLabel}</span>
                                </span>
                                <span>•</span>
                                <span className="text-red-600 font-medium text-[10px]">YouTube</span>
                                {isDone && (
                                  <>
                                    <span>•</span>
                                    <span className="text-emerald-600 font-semibold flex items-center space-x-0.5">
                                      <CheckCircle className="w-3 h-3" />
                                      <span>Done</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Chapters Jump inside Classes */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-[var(--brand-primary,#2563eb)]" />
                        <span>Playing: {currentLecture.shortTitle} Chapters</span>
                      </span>
                      <div className="space-y-1">
                        {currentLecture.chapters.map((ch, idx) => (
                          <div
                            key={idx}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] flex items-center justify-between text-slate-600 dark:text-slate-400"
                          >
                            <span className="truncate pr-2">{ch.title}</span>
                            <span className="font-mono text-[10px] text-slate-400 flex-shrink-0">
                              {Math.floor(ch.timeSeconds / 60)}:00
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* Option 2: Study Notes & Mindmaps                     */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'notes' && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Handwritten Notes &amp; Mindmaps ({studyNotes.length})
                    </span>

                    <div className="space-y-2.5">
                      {studyNotes.map((note, idx) => (
                        <div
                          key={note.id}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 space-y-2 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Badge variant={idx === 0 ? 'primary' : 'secondary'} size="sm" className="mb-1">
                                {note.badge}
                              </Badge>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                                {note.title}
                              </h4>
                            </div>
                            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                          </div>

                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {note.description}
                          </p>

                          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
                            <span>{note.pages} Pages • {note.readTime}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setActiveView('notes');
                              }}
                              className="text-xs px-2.5 py-1 text-[var(--brand-primary,#2563eb)] border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950/50"
                            >
                              <BookOpen className="w-3.5 h-3.5 mr-1" />
                              <span>Read Notes</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* Option 3: CBT Mocks & Chapter Quizzes                */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'mocks' && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Unit CBT Tests &amp; Quizzes (2)
                    </span>

                    <div className="space-y-2.5">
                      <div className="p-3.5 rounded-xl border-2 border-red-200 dark:border-red-950/60 bg-red-50/30 dark:bg-red-950/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="error" size="sm">NTA Pattern</Badge>
                          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                            Full Length
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Sunday Full-Length CBT Mock Test 1
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          50 Questions • 60 Minutes • +4 / -1 Marking
                        </p>
                        <Link href={`/study/${offering.id}/cbt/test-sunday-01`}>
                          <Button variant="danger" size="sm" className="w-full mt-1.5 text-xs">
                            <Trophy className="w-3.5 h-3.5 mr-1.5" />
                            <span>Launch Test Simulator</span>
                          </Button>
                        </Link>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="primary" size="sm">Chapter Quiz</Badge>
                          <span className="text-[10px] text-slate-400">Quick Prep</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Chapter 1 Quick Revision Practice Quiz
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          15 Questions • 20 Minutes • Instant Solutions
                        </p>
                        <Link href={`/study/${offering.id}/cbt/test-sunday-01`}>
                          <Button variant="outline" size="sm" className="w-full mt-1.5 text-xs">
                            <span>Start Quick Quiz</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* Option 4: Solved PYQs (2022-2026)                    */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'pyqs' && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Solved Previous Year Questions (1)
                    </span>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 text-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-[var(--brand-primary,#2563eb)] flex items-center justify-center mx-auto">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          CUET UG Solved PYQs (2022 to 2026)
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          All official NTA CUET question papers with detailed answer rationales and NCERT page citations.
                        </p>
                      </div>
                      <Button variant="primary" size="sm" className="w-full text-xs">
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        <span>Download Solved Compilation (PDF)</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Subject Switcher */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Other Subject Units</span>
                  <Link href={`/study/${offering.id}`} className="text-[var(--brand-primary,#2563eb)] hover:underline normal-case">
                    View All
                  </Link>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {json.units.slice(0, 4).map((unit) => {
                    const isCurrent = unit.slug === params.unitId;
                    return (
                      <Link key={unit.id} href={`/study/${offering.id}/u/${unit.slug}`}>
                        <span
                          className={clsx(
                            'inline-block px-2 py-1 rounded-md text-[11px] font-medium transition-colors',
                            isCurrent
                              ? 'bg-[var(--brand-primary,#2563eb)] text-white font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          )}
                        >
                          {unit.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Quick Doubt Support Card in Sidebar */}
            <Card padding="sm" className="border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-emerald-500 text-white flex-shrink-0">
                  <MessageCircle className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Need Doubt Help?
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Connect with mentors on WhatsApp
                  </p>
                </div>
              </div>
              <a href={waDoubtUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-2.5 py-1">
                  <span>Ask</span>
                </Button>
              </a>
            </Card>
          </div>
        </div>
      </div>

      {/* Paste / Change YouTube Video URL Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-100 dark:bg-red-950 text-red-600 rounded-lg">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Set YouTube Video Link
                  </h3>
                  <p className="text-[11px] text-slate-500">{currentLecture.shortTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsUrlModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVideoUrl} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  YouTube Video Link (Unlisted Mode)
                </label>
                <input
                  type="text"
                  required
                  value={customInputUrl}
                  onChange={(e) => setCustomInputUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  Teachers upload lectures to YouTube set to <strong>Unlisted</strong>. Only students enrolled in this paid batch will be able to play the video here.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-800 dark:text-blue-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>How Video Privacy Works:</span>
                </span>
                <p>
                  1. Teacher marks video <strong>Unlisted</strong> in YouTube Studio.<br/>
                  2. Teacher pastes the link in their Teacher Panel.<br/>
                  3. Only enrolled students who bought this batch can access this page to stream the lecture.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsUrlModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="gap-1.5">
                  {customUrlSaved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Loaded!</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span>Play Video</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
