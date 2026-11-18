'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Search, UserPlus, Users, CheckCircle2, X } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function StudentRosterPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCourseId, setNewCourseId] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const loadRoster = useCallback(async () => {
    let slug = 'cuet-humanities';
    const stored = localStorage.getItem('simplicion_active_tenant');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.slug) slug = parsed.slug;
      } catch {
        // ignore
      }
    }
    try {
      const [stuRes, crsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/academy/students?tenant=${encodeURIComponent(slug)}`),
        fetch(`${API_BASE_URL}/courses?tenant=${encodeURIComponent(slug)}`),
      ]);
      const [stuData, crsData] = await Promise.all([stuRes.json(), crsRes.json()]);
      if (stuData.success) setEnrollments(stuData.enrollments || []);
      if (crsData.success) {
        const list = crsData.courses || [];
        setCourses(list);
        if (list.length > 0 && !newCourseId) setNewCourseId(list[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  }, [newCourseId]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCourseId) return;
    setIsEnrolling(true);
    try {
      const selectedCourse = courses.find((c) => c.id === newCourseId);
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(newCourseId)}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: `stu_manual_${Date.now()}`,
          studentName: newName.trim(),
          studentEmail: newEmail.trim(),
          amountPaid: selectedCourse?.priceInr || 0,
          paymentId: `manual_enr_${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewName('');
        setNewEmail('');
        setIsAddModalOpen(false);
        await loadRoster();
        showToast('Student enrolled and synced to Supabase!');
      } else {
        showToast(data.error || 'Could not enroll student.');
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return enrollments;
    return enrollments.filter(
      (e) =>
        e.studentName?.toLowerCase().includes(q) ||
        e.studentEmail?.toLowerCase().includes(q) ||
        e.studentId?.toLowerCase().includes(q) ||
        e.courseTitle?.toLowerCase().includes(q)
    );
  }, [enrollments, search]);

  return (
    <div className="space-y-6 w-full min-w-0 pb-10">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0f172a] text-white px-4 py-3 rounded-xl shadow-lg text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold text-[#0f172a]"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            Student Roster &amp; Enrollments
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Live student enrollments across all courses backed by Supabase PostgreSQL.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          disabled={courses.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm disabled:opacity-50 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Manual Enrollment</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, email, ID, or course..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:bg-white focus:border-[#2563eb]"
          />
        </div>
        <span className="text-xs font-medium text-[#64748b]">
          Showing {filtered.length} of {enrollments.length} Enrollments
        </span>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-[#64748b]">Loading enrollments...</div>
        ) : filtered.length === 0 ? (
          <div className="p-14 text-center space-y-2">
            <Users className="w-8 h-8 text-[#2563eb] mx-auto" />
            <p className="text-sm font-bold text-[#0f172a]">No student enrollments yet</p>
            <p className="text-xs text-[#64748b]">
              Students who enroll via your Student Website appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4 text-right">Enrolled On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filtered.map((enr) => (
                  <tr key={enr.id} className="hover:bg-[#f8fafc] transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#0f172a]">{enr.studentName}</p>
                      {enr.studentEmail && (
                        <span className="text-[11px] text-[#64748b]">{enr.studentEmail}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#475569]">{enr.studentId}</td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/batches/${enr.courseId}`}
                        className="font-semibold text-[#2563eb] hover:underline"
                      >
                        {enr.courseTitle}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#047857]">
                      {Number(enr.amountPaid || 0) > 0
                        ? `₹${Number(enr.amountPaid).toLocaleString('en-IN')}`
                        : 'Free'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#64748b]">
                      {new Date(enr.enrolledAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Enrollment Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/50 backdrop-blur-[2px]"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-[#e2e8f0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0f172a]">Manual Student Enrollment</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleManualEnroll} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Aarav Patel"
                  className="w-full px-3.5 py-2 text-sm border border-[#cbd5e1] rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">Student Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="student@email.com"
                  className="w-full px-3.5 py-2 text-sm border border-[#cbd5e1] rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">Assign Course *</label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#cbd5e1] rounded-lg"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#334155] border border-[#cbd5e1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEnrolling}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60"
                >
                  {isEnrolling ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
