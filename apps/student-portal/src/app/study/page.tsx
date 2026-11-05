'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@simplicion/ui';
import { BookOpen, ArrowRight, PlayCircle, Trophy, User, Calendar, MessageCircle } from 'lucide-react';
import { loadReferenceTenant } from '../../lib/tenant-data';

export default function StudyHubIndexPage() {
  const { tenant, offerings } = loadReferenceTenant();
  const [student, setStudent] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('simplicion_student');
    if (saved) {
      try {
        setStudent(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  return (
    <div className="py-12 bg-slate-50/60 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary,#2563eb)]">
              {tenant.name} • {tenant.settings.labels.studyEntry}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Welcome back, {student?.name || 'Aspirant'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Continue your structured CUET preparation and track your Sunday CBT mock rankings.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/study/off-cuet-01/cbt/test-sunday-01">
              <Button variant="danger" size="sm" className="shadow-sm">
                <Trophy className="w-4 h-4 mr-1.5" />
                <span>Sunday CBT Mock Active</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Continue Learning Card */}
        <Card padding="lg" className="border-2 border-[var(--brand-primary,#2563eb)]/30 bg-gradient-to-r from-blue-50/70 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <Badge variant="primary" size="sm">Resume Learning</Badge>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Political Science • Chapter 1: The Cold War Era &amp; Non-Aligned Movement
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                You were watching Lecture 2 (28m remaining) • 65% Completed
              </p>
            </div>

            <Link href="/study/off-cuet-01/u/political-science">
              <Button variant="primary" size="md">
                <PlayCircle className="w-4 h-4 mr-2" />
                <span>Resume Lecture</span>
              </Button>
            </Link>
          </div>
        </Card>

        {/* Enrolled Batches */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Your Enrolled Batches &amp; Courses
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offerings.map((offering) => {
              const json = offering.toJSON();
              return (
                <Card key={json.id} hoverable padding="lg" className="flex flex-col justify-between border-slate-200 dark:border-slate-800">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary,#2563eb)] bg-blue-50 dark:bg-blue-950/60 py-1 px-2.5 rounded-md">
                        {json.type.toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Active Access
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {json.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {json.description}
                    </p>

                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Course Progress</span>
                        <span className="font-semibold text-slate-900 dark:text-white">42%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-[var(--brand-primary,#2563eb)] h-full w-[42%]" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {json.units.length} Core Subjects Included
                    </span>

                    <Link href={`/study/${json.id}`}>
                      <Button variant="primary" size="sm">
                        <span>Open Study Hub</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

