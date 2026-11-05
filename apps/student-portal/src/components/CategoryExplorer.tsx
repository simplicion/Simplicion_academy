'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Badge, Button, Modal, Input } from '@simplicion/ui';
import { Bell, ArrowRight, BookOpen, Layers, CheckCircle } from 'lucide-react';
import { CategoryData } from '../lib/tenant-data';

export interface CategoryExplorerProps {
  categories: CategoryData[];
}

export const CategoryExplorer: React.FC<CategoryExplorerProps> = ({ categories }) => {
  const [notifyCategory, setNotifyCategory] = useState<CategoryData | null>(null);
  const [notifyPhone, setNotifyPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyPhone.replace(/\D/g, '').length >= 10) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setNotifyCategory(null);
        setNotifyPhone('');
      }, 1500);
    }
  };

  return (
    <section id="categories" className="py-16 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[var(--brand-primary,#2563eb)] mb-2">
              <Layers className="w-4 h-4" />
              <span>Academic Explorer</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Explore by Class &amp; Target Exam
            </h2>
          </div>
          <p className="mt-2 md:mt-0 text-xs text-slate-500 max-w-sm">
            Structured study material, bilingual question banks, and live syllabus tracks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <Card
              key={cat.id}
              hoverable={cat.isActive}
              className={`p-5 flex flex-col justify-between transition-all ${
                !cat.isActive ? 'bg-slate-50/70 dark:bg-slate-900/40 opacity-90' : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">🎓</span>
                  {cat.isActive ? (
                    <Badge variant="success" size="sm">
                      {cat.count} Live Batches
                    </Badge>
                  ) : (
                    <Badge variant="secondary" size="sm">
                      Coming Soon
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">{cat.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {cat.description}
                </p>
              </div>

              <div>
                {cat.isActive ? (
                  <Link href="#offerings" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      <span>Explore Offerings</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-slate-500 dark:text-slate-400 hover:text-[var(--brand-primary,#2563eb)]"
                    onClick={() => setNotifyCategory(cat)}
                  >
                    <Bell className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                    <span>Notify Me on Launch</span>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Notify Me Lead Capture Modal */}
      <Modal
        isOpen={!!notifyCategory}
        onClose={() => setNotifyCategory(null)}
        title={`Get Notified: ${notifyCategory?.name}`}
        description="Be the first to receive early-bird syllabus access and launch discount codes."
      >
        {isSubmitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white">You&apos;re on the priority list!</h4>
            <p className="text-xs text-slate-500">We will notify you via SMS / WhatsApp once enrollment opens.</p>
          </div>
        ) : (
          <form onSubmit={handleNotifySubmit} className="space-y-4">
            <Input
              label="Your WhatsApp Number"
              placeholder="10-digit mobile number"
              type="tel"
              maxLength={10}
              value={notifyPhone}
              onChange={(e) => setNotifyPhone(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" className="w-full">
              <span>Notify Me on Launch</span>
              <Bell className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}
      </Modal>
    </section>
  );
};

