'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@simplicion/ui';
import { Play, Pause, RotateCcw, FastForward, Volume2, Maximize, Clock } from 'lucide-react';

export interface VideoChapter {
  timeSeconds: number;
  title: string;
}

export interface VideoPlayerProps {
  title: string;
  videoUrl?: string;
  durationMinutes?: number;
  chapters?: VideoChapter[];
  onProgress?: (progressPercent: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  title,
  durationMinutes = 45,
  chapters = [
    { timeSeconds: 0, title: 'Introduction & Core Concepts' },
    { timeSeconds: 900, title: 'Key Thinkers & Historical Milestones' },
    { timeSeconds: 1800, title: 'Critical Examination MCQs' },
  ],
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const totalSeconds = durationMinutes * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            return totalSeconds;
          }
          return prev + playbackSpeed;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const speeds = [0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="flex flex-col space-y-4 max-w-4xl mx-auto">
      {/* Video Viewport / Simulated Canvas */}
      <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-6 border border-slate-800 select-none">
        {/* Top Watermark in Video */}
        <div className="flex items-center justify-between text-xs text-slate-400 opacity-80">
          <span className="font-semibold text-white tracking-wide">{title}</span>
          <span className="font-mono text-[11px] bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
            Protected Stream
          </span>
        </div>

        {/* Center Play Indicator */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-[var(--brand-primary,#2563eb)] hover:opacity-90 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
        </div>

        {/* Bottom Controls Bar */}
        <div className="space-y-2 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800">
          {/* Progress Timeline */}
          <div
            className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              setCurrentTime(pos * totalSeconds);
            }}
          >
            <div
              className="bg-[var(--brand-primary,#2563eb)] h-full transition-all"
              style={{ width: `${(currentTime / totalSeconds) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
            <div className="flex items-center space-x-3">
              <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button onClick={() => setCurrentTime(Math.max(0, currentTime - 10))} className="hover:text-white" title="Rewind 10s">
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px]">
                {formatTime(currentTime)} / {formatTime(totalSeconds)}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Speed Toggle */}
              <div className="flex items-center space-x-1 bg-slate-800 px-2 py-0.5 rounded-md">
                {speeds.map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      playbackSpeed === s
                        ? 'bg-[var(--brand-primary,#2563eb)] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Navigation Markers */}
      <Card padding="md" className="border border-slate-200 dark:border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
          <Clock className="w-3.5 h-3.5 mr-1.5 text-[var(--brand-primary,#2563eb)]" />
          <span>Lecture Chapters</span>
        </h4>
        <div className="space-y-1.5">
          {chapters.map((ch, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentTime(ch.timeSeconds)}
              className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-between text-xs transition-colors"
            >
              <span className="font-medium text-slate-800 dark:text-slate-200">{ch.title}</span>
              <span className="font-mono text-slate-400 text-[11px]">{formatTime(ch.timeSeconds)}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

