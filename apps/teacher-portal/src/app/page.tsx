'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  IndianRupee,
  BookOpen,
  MessageCircleQuestion,
  Palette,
  FileCheck2,
  ChevronRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Card, Button, Badge } from '@simplicion/ui';
import { MetricCard } from '../components/dashboard/MetricCard';

export default function TeacherDashboardPage() {
  const batches = [
    {
      id: 'cuet-humanities-foundation-2027',
      name: 'CUET 2027: Humanities Foundation Batch',
      target: 'CUET 2027 UG',
      enrolled: 890,
      price: '₹ 4,999',
      revenue: '₹ 44,49,110',
      status: 'active',
      completion: 68,
    },
    {
      id: 'cuet-history-domain-crash',
      name: 'CUET History Domain Intensive Crash Course',
      target: 'CUET 2026',
      enrolled: 420,
      price: '₹ 1,999',
      revenue: '₹ 8,39,580',
      status: 'active',
      completion: 82,
    },
    {
      id: 'political-science-ncert-mastery',
      name: 'Political Science Class 12 NCERT Mastery',
      target: 'Board + CUET',
      enrolled: 110,
      price: 'Free',
      revenue: '₹ 0',
      status: 'active',
      completion: 45,
    },
  ];

  const recentDoubts = [
    {
      id: 'd1',
      student: 'Aarav Sharma',
      batch: 'CUET 2027 Humanities Foundation',
      topic: 'Ashokan Inscriptions & Brahmi decipherment',
      time: '15 mins ago',
      status: 'pending',
    },
    {
      id: 'd2',
      student: 'Sneha Mukherjee',
      batch: 'CUET History Domain Crash',
      topic: 'Harappan script & seals significance in trade',
      time: '1 hour ago',
      status: 'pending',
    },
    {
      id: 'd3',
      student: 'Vikas Rao',
      batch: 'CUET 2027 Humanities Foundation',
      topic: 'Difference between Megasthenes Indica and Kautilya Arthashastra',
      time: '3 hours ago',
      status: 'answered',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="secondary" size="sm" className="mb-3 bg-white/20 text-white border-0">
            Academy Overview
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, Dr. Rajesh Varma
          </h2>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed">
            Your academy has 1,420 enrolled students actively learning. 3 student doubts are awaiting your response in the CUET Humanities batches.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/builder">
              <Button variant="secondary" size="md" className="gap-2 bg-white text-blue-900 hover:bg-blue-50 font-bold">
                <Palette className="w-4 h-4 text-blue-700" />
                <span>Customize Student Portal</span>
              </Button>
            </Link>
            <Link href="/batches">
              <Button variant="outline" size="md" className="gap-2 text-white border-white/30 hover:bg-white/10 font-bold">
                <BookOpen className="w-4 h-4" />
                <span>Manage Batches</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative graphic */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Students"
          value="1,420"
          change="+18.4%"
          trend="up"
          icon={Users}
          description="vs last 30 days"
        />
        <MetricCard
          title="Gross Revenue"
          value="₹ 52,88,690"
          change="+24.2%"
          trend="up"
          icon={IndianRupee}
          description="lifetime gross"
        />
        <MetricCard
          title="Live Batches"
          value="3 Active"
          change="100% On-Track"
          trend="neutral"
          icon={BookOpen}
          description="CUET Humanities"
        />
        <MetricCard
          title="Doubt Resolution"
          value="96.2%"
          change="3 pending"
          trend="up"
          icon={MessageCircleQuestion}
          description="avg reply 42m"
        />
      </div>

      {/* Grid: Batches Performance & Recent Doubts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Batches Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Batches & Offerings</h3>
              <p className="text-xs text-slate-500">Overview of student participation and commercial metrics</p>
            </div>
            <Link href="/batches">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Batch Name</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Enrolled</th>
                    <th className="py-3 px-4">Revenue</th>
                    <th className="py-3 px-4">Avg Progress</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{batch.name}</p>
                        <span className="text-[10px] text-slate-500">{batch.target}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{batch.price}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{batch.enrolled}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">{batch.revenue}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${batch.completion}%` }}
                            ></div>
                          </div>
                          <span className="text-[11px] font-bold text-slate-600">{batch.completion}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/batches/${batch.id}/curriculum`}>
                          <Button variant="outline" size="sm" className="text-[11px] py-1 px-2.5">
                            Curriculum
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Doubts Queue Widget (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Doubts Queue</h3>
              <p className="text-xs text-slate-500">Unresolved academic queries</p>
            </div>
            <Link href="/doubts">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <span>All Doubts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {recentDoubts.map((doubt) => (
              <Card key={doubt.id} className="p-4 hover:border-slate-300 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{doubt.student}</span>
                    <span className="text-[10px] text-slate-400">• {doubt.time}</span>
                  </div>
                  {doubt.status === 'pending' ? (
                    <Badge variant="warning" size="sm">Pending</Badge>
                  ) : (
                    <Badge variant="success" size="sm">Resolved</Badge>
                  )}
                </div>

                <p className="text-xs text-slate-700 font-medium line-clamp-2">
                  "{doubt.topic}"
                </p>

                <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[10px] text-slate-500">
                  <span className="truncate max-w-[180px]">{doubt.batch}</span>
                  <Link href="/doubts">
                    <span className="text-blue-600 hover:underline font-bold">Reply &rarr;</span>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

