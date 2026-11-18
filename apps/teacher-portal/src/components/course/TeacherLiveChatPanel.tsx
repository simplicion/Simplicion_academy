'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageSquare,
  Pin,
  Timer,
  VolumeX,
  Volume2,
  Send,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface TeacherLiveChatPanelProps {
  courseId: string;
  onToast?: (msg: string) => void;
}

export const TeacherLiveChatPanel: React.FC<TeacherLiveChatPanelProps> = ({
  courseId,
  onToast,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [chatMuted, setChatMuted] = useState(false);
  const [chatSlowMode, setChatSlowMode] = useState(false);
  const [draft, setDraft] = useState('');
  const [pinNext, setPinNext] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const broadcastChannelRef = useRef<any>(null);

  const loadChat = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/chat`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setChatMuted(Boolean(data.chatMuted));
        setChatSlowMode(Boolean(data.chatSlowMode));
      }
    } catch {
      // ignore
    }
  }, [courseId]);

  useEffect(() => {
    loadChat();

    let channel: any = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        const supabase = createSupabaseClient();
        channel = supabase
          .channel(`course-live-chat-${courseId}`, {
            config: { broadcast: { self: false } },
          })
          .on('broadcast', { event: 'chat_message' }, ({ payload }: any) => {
            if (payload?.id) {
              setMessages((prev) =>
                prev.some((m) => m.id === payload.id) ? prev : [...prev, payload]
              );
            }
          })
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'CourseChatMessage', filter: `courseId=eq.${courseId}` },
            () => loadChat()
          )
          .subscribe();
        broadcastChannelRef.current = channel;
      }
    } catch {
      // optional
    }

    return () => {
      broadcastChannelRef.current = null;
      if (channel) {
        try {
          createSupabaseClient().removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, [courseId, loadChat]);

  const toggleSetting = async (field: 'chatMuted' | 'chatSlowMode') => {
    const nextVal = field === 'chatMuted' ? !chatMuted : !chatSlowMode;
    const res = await fetch(
      `${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/chat-settings`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: nextVal }),
      }
    );
    const data = await res.json();
    if (data.success) {
      if (field === 'chatMuted') {
        setChatMuted(nextVal);
        onToast?.(nextVal ? 'Live classroom chat paused.' : 'Live classroom chat resumed.');
      } else {
        setChatSlowMode(nextVal);
        onToast?.(nextVal ? 'Slow mode enabled (1 msg / 3s).' : 'Slow mode disabled.');
      }
    }
  };

  const handlePinToggle = async (messageId: string) => {
    const res = await fetch(
      `${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/chat/${encodeURIComponent(messageId)}/pin`,
      { method: 'PATCH' }
    );
    const data = await res.json();
    if (data.success) {
      await loadChat();
      onToast?.(data.message?.isPinned ? 'Message pinned in Student Classroom.' : 'Message unpinned.');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setIsSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: 'teacher_educator',
          senderName: 'Educator',
          senderRole: 'teacher',
          message: draft.trim(),
          isPinned: pinNext,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.message && broadcastChannelRef.current) {
          broadcastChannelRef.current
            .send({ type: 'broadcast', event: 'chat_message', payload: data.message })
            .catch(() => {});
        }
        setDraft('');
        setPinNext(false);
        await loadChat();
        if (pinNext) onToast?.('Announcement sent & pinned to classroom chat.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const pinnedMsg = messages.find((m) => m.isPinned);

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
      {/* Collapsible Header with 3 Minimal Moderation Icon Toggles */}
      <div
        onClick={() => setIsExpanded((v) => !v)}
        className={`px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 bg-[#f8fafc] cursor-pointer select-none ${
          isExpanded ? 'border-b border-[#e2e8f0]' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[#64748b]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#64748b]" />
          )}
          <MessageSquare className="w-4 h-4 text-[#2563eb]" />
          <h2 className="text-sm font-bold text-[#0f172a]">Live Classroom Chat &amp; Controls</h2>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e2e8f0]/70 text-[#475569]">
            {messages.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => {
              setIsExpanded(true);
              setPinNext((p) => !p);
            }}
            title="Pin next message as announcement"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
              pinNext
                ? 'bg-[#eff6ff] border-[#2563eb] text-[#1d4ed8]'
                : 'bg-white border-[#cbd5e1] text-[#475569] hover:text-[#0f172a]'
            }`}
          >
            <Pin className="w-3 h-3" />
            <span>Pin Announcement</span>
          </button>

          <button
            type="button"
            onClick={() => toggleSetting('chatSlowMode')}
            title="Toggle 3s slow mode for students"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
              chatSlowMode
                ? 'bg-[#fffbeb] border-[#f59e0b] text-[#b45309]'
                : 'bg-white border-[#cbd5e1] text-[#475569] hover:text-[#0f172a]'
            }`}
          >
            <Timer className="w-3 h-3" />
            <span>{chatSlowMode ? 'Slow Mode On' : 'Slow Mode'}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleSetting('chatMuted')}
            title="Pause or resume student chat"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
              chatMuted
                ? 'bg-[#fef2f2] border-[#dc2626] text-[#b91c1c]'
                : 'bg-white border-[#cbd5e1] text-[#475569] hover:text-[#0f172a]'
            }`}
          >
            {chatMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            <span>{chatMuted ? 'Chat Paused' : 'Pause Chat'}</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Active Pinned Banner */}
          {pinnedMsg && (
            <div className="px-4 py-2 bg-[#eff6ff] border-b border-[#dbeafe] flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#1e3a8a] min-w-0">
                <Pin className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                <span className="font-semibold shrink-0">Pinned:</span>
                <span className="truncate">{pinnedMsg.message}</span>
              </div>
              <button
                type="button"
                onClick={() => handlePinToggle(pinnedMsg.id)}
                className="text-[11px] font-semibold text-[#2563eb] hover:underline shrink-0"
              >
                Unpin
              </button>
            </div>
          )}

          {/* Messages Feed */}
          <div className="max-h-56 overflow-y-auto p-4 space-y-2">
            {messages.length === 0 ? (
              <p className="text-xs text-[#94a3b8] text-center py-6">
                No live chat messages yet. Send an announcement or moderate student chat here.
              </p>
            ) : (
              messages.slice(-25).map((msg) => (
                <div
                  key={msg.id}
                  className={`group px-3 py-2 rounded-lg text-xs flex items-start justify-between gap-2 ${
                    msg.senderRole === 'teacher'
                      ? 'bg-[#eff6ff] border border-[#dbeafe]'
                      : 'bg-[#f8fafc] border border-[#e2e8f0]'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="font-bold text-[#0f172a] mr-1.5">
                      {msg.senderName}
                      {msg.senderRole === 'teacher' ? ' (You)' : ''}
                    </span>
                    <span className="text-[#334155] break-words">{msg.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePinToggle(msg.id)}
                    title={msg.isPinned ? 'Unpin message' : 'Pin as classroom announcement'}
                    className={`p-1 rounded transition shrink-0 ${
                      msg.isPinned
                        ? 'text-[#2563eb]'
                        : 'text-[#94a3b8] opacity-0 group-hover:opacity-100 hover:text-[#2563eb]'
                    }`}
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Educator Composer */}
          <form
            onSubmit={handleSend}
            className="px-4 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2"
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                pinNext
                  ? 'Write an announcement to pin at top of student chat...'
                  : 'Send a message to enrolled students...'
              }
              className="flex-1 px-3 py-2 text-xs bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
            />
            <button
              type="submit"
              disabled={isSending || !draft.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{pinNext ? 'Send & Pin' : 'Send'}</span>
            </button>
          </form>
        </>
      )}
    </div>
  );
};
