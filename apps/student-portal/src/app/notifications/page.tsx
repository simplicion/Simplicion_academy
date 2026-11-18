'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Radio, MessageCircleQuestion, CheckCircle2, ArrowLeft } from 'lucide-react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';
import { openOne80IdentityBottomSheet } from '../../lib/one80-sdk';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function StudentNotificationsPage() {
  const [student, setStudent] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async (studentId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/notifications?studentId=${encodeURIComponent(studentId)}`
      );
      const data = await res.json();
      if (data.success) setNotifications(data.notifications || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let activeStudentId = '';
    const saved = localStorage.getItem('simplicion_student');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStudent(parsed);
        if (parsed?.id) {
          activeStudentId = parsed.id;
          loadNotifications(parsed.id);
        } else {
          setIsLoading(false);
        }
      } catch {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }

    if (!activeStudentId) return;
    let channel: any = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        const supabase = createSupabaseClient();
        channel = supabase
          .channel(`page-notifs-${activeStudentId}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'StudentNotification' },
            () => loadNotifications(activeStudentId)
          )
          .subscribe();
      }
    } catch {
      // optional
    }

    return () => {
      if (channel) {
        try {
          createSupabaseClient().removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, [loadNotifications]);

  const handleMarkRead = async (id: string) => {
    await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH',
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    window.dispatchEvent(new Event('simplicion-notifications-updated'));
  };

  const handleMarkAllRead = async () => {
    if (!student?.id) return;
    await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: student.id }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    window.dispatchEvent(new Event('simplicion-notifications-updated'));
  };

  if (!student && !isLoading) {
    return (
      <div className="min-h-[70vh] bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white rounded-xl border border-[#e2e8f0] p-8 text-center space-y-4">
          <Bell className="w-8 h-8 text-[#2563eb] mx-auto" />
          <h1 className="text-lg font-bold text-[#0f172a]">Login to View Notifications</h1>
          <button
            type="button"
            onClick={() =>
              openOne80IdentityBottomSheet({
                onSuccess: (res) => {
                  const payload = {
                    id: res.user?.id || res.user?.sub || `180_usr_${Date.now()}`,
                    name: res.user?.name || 'Student',
                    email: res.user?.email || '',
                    phone: res.user?.phone || '',
                    provider: '180_identity',
                  };
                  localStorage.setItem('simplicion_student', JSON.stringify(payload));
                  setStudent(payload);
                  loadNotifications(payload.id);
                },
              })
            }
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8]"
          >
            Login with 180 Identity
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748b] hover:text-[#2563eb]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Courses</span>
            </Link>
            <h1
              className="text-xl font-bold text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              Notifications
            </h1>
            <p className="text-xs text-[#64748b]">
              Doubt replies from educators and live class alerts appear here in real time.
            </p>
          </div>

          {notifications.some((n) => !n.isRead) && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#334155] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1]"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-10 bg-white rounded-xl border border-[#e2e8f0] text-center text-sm text-[#64748b]">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 bg-white rounded-xl border border-[#e2e8f0] text-center space-y-2">
            <Bell className="w-8 h-8 text-[#94a3b8] mx-auto" />
            <p className="text-sm font-semibold text-[#0f172a]">You&apos;re all caught up</p>
            <p className="text-xs text-[#64748b]">
              Replies to your doubts and live class announcements will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                  n.isRead
                    ? 'bg-white border-[#e2e8f0]'
                    : 'bg-[#eff6ff]/60 border-[#bfdbfe]'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-center shrink-0 mt-0.5">
                    {n.type === 'live_started' ? (
                      <Radio className="w-4 h-4 text-[#dc2626]" />
                    ) : n.type === 'doubt_reply' ? (
                      <MessageCircleQuestion className="w-4 h-4 text-[#2563eb]" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-bold text-[#0f172a]">{n.title}</p>
                    <p className="text-xs text-[#475569] leading-relaxed">{n.body}</p>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[11px] text-[#94a3b8]">
                        {new Date(n.createdAt).toLocaleString('en-IN')}
                      </span>
                      {n.linkUrl && (
                        <Link
                          href={n.linkUrl}
                          onClick={() => handleMarkRead(n.id)}
                          className="text-xs font-semibold text-[#2563eb] hover:underline"
                        >
                          Open Lesson →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(n.id)}
                    className="text-[11px] font-semibold text-[#2563eb] hover:underline shrink-0"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
