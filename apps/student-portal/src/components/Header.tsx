'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@simplicion/ui';
import { BookOpen, User, LogOut } from 'lucide-react';
import { AuthModal } from './AuthModal';

export interface HeaderProps {
  tenantName: string;
  tagline: string;
  headerLayout?: 'login-left' | 'login-right';
  studyLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({
  tenantName,
  tagline,
  headerLayout = 'login-right',
  studyLabel = 'Study',
}) => {
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('simplicion_student');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        // ignore error
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('simplicion_student');
    setUser(null);
  };

  const authSection = (
    <div className="flex items-center space-x-3">
      {user ? (
        <div className="flex items-center space-x-3 bg-blue-50 dark:bg-slate-800 py-1.5 px-3 rounded-full border border-blue-200 dark:border-slate-700">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-blue-900 dark:text-blue-200">
            <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Welcome, {user.name}</span>
          </div>
          <Link
            href="/study"
            className="flex items-center space-x-1 text-xs font-bold text-white bg-[var(--brand-primary,#2563eb)] hover:opacity-90 px-3 py-1 rounded-full transition-opacity"
          >
            <BookOpen className="w-3 h-3" />
            <span>{studyLabel}</span>
          </Link>
          <button
            onClick={handleLogout}
            title="Log out"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <Button variant="primary" size="sm" onClick={() => setIsAuthOpen(true)}>
          Login / Register
        </Button>
      )}
    </div>
  );

  const brandSection = (
    <Link href="/" className="flex flex-col text-left group">
      <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-[var(--brand-primary,#2563eb)] transition-colors">
        {tenantName}
      </span>
      {tagline && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 italic">
          &ldquo;{tagline}&rdquo;
        </span>
      )}
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {headerLayout === 'login-left' ? (
            <>
              {authSection}
              {brandSection}
            </>
          ) : (
            <>
              {brandSection}
              {authSection}
            </>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(newUser) => {
          setUser(newUser);
          setIsAuthOpen(false);
        }}
      />
    </>
  );
};

