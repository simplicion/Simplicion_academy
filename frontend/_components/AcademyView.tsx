'use client';

import { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Sparkles, 
  PlayCircle, 
  Clock, 
  TrendingUp, 
  Search, 
  Bot, 
  ChevronRight, 
  Zap, 
  ShieldCheck,
  Star,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const TABS = [
  { id: 'browse', label: 'Browse', fullLabel: 'Browse Courses', icon: BookOpen },
];

const CATEGORIES = [
  'All Domains', 
  'Startup Finance', 
  'Product Strategy', 
  'AI & Engineering', 
  'Venture Capital', 
  'Leadership'
];

interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  estimatedMinutes: number;
  instructorName: string;
  instructorRole: string;
  description: string;
  progress?: number;
  isEnrolled?: boolean;
}

const SAMPLE_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Startup Financial Modeling & Unit Economics',
    slug: 'startup-financial-modeling',
    category: 'Startup Finance',
    level: 'Intermediate',
    estimatedMinutes: 180,
    instructorName: 'Sarah Jenkins',
    instructorRole: 'Ex-YC Partner',
    description: 'Master CAC, LTV, Burn Rate, Runway projection, and building investor-grade financial models.',
    progress: 65,
    isEnrolled: true,
  },
  {
    id: 'c2',
    title: 'Architecting AI-Native Applications in 2026',
    slug: 'ai-native-architecture',
    category: 'AI & Engineering',
    level: 'Advanced',
    estimatedMinutes: 240,
    instructorName: 'Dr. Alex Vance',
    instructorRole: 'Head of AI Research',
    description: 'Learn RAG pipelines, LLM multi-agent orchestration, vector index optimization, and evaluation frameworks.',
    progress: 20,
    isEnrolled: true,
  },
  {
    id: 'c3',
    title: 'Pitch Deck & Term Sheet Negotiations for Series A',
    slug: 'pitch-deck-term-sheets',
    category: 'Venture Capital',
    level: 'Advanced',
    estimatedMinutes: 120,
    instructorName: 'Marcus Vance',
    instructorRole: 'General Partner',
    description: 'Deconstruct real term sheets, liquidation preferences, anti-dilution, and pitching to tier-1 VCs.',
    progress: 0,
    isEnrolled: false,
  },
  {
    id: 'c4',
    title: 'Product-Led Growth (PLG) & Virality Engines',
    slug: 'plg-virality-engines',
    category: 'Product Strategy',
    level: 'Intermediate',
    estimatedMinutes: 150,
    instructorName: 'Elena Rostova',
    instructorRole: 'VP Product Growth',
    description: 'Build viral loops, activation funnels, self-serve onboarding, and product monetization triggers.',
    progress: 0,
    isEnrolled: false,
  },
];

export default function AcademyView() {
  const [selectedCategory, setSelectedCategory] = useState('All Domains');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const filteredCourses = SAMPLE_COURSES.filter(course => {
    const matchesCategory = selectedCategory === 'All Domains' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAskAiTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    setAiResponse(null);

    setTimeout(() => {
      setIsAiLoading(false);
      setAiResponse(
        `Based on Pitchin Academy's Startup Finance domain: Unit economics evaluate direct revenues and costs for a single unit of your business. Target an LTV:CAC ratio ≥ 3.0x and CAC payback < 12 months.`
      );
    }, 900);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 pb-20">
      {/* Sticky Header + Tabs */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-4 pb-3 space-y-3">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Pitchin Academy
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Work Intelligence & Executive Founder Domain
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3" />
              Verified Proof-of-Work
            </span>
          </div>

        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-4 pb-28 space-y-4 sm:space-y-6">

      {/* Hero Banner Container */}
      <div className="relative rounded-2xl bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-900 p-5 sm:p-7 text-white shadow-lg shadow-indigo-600/10 border border-indigo-500/20 overflow-hidden min-h-fit">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-1.5 leading-snug">
            Master Founder Capabilities
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed mb-4 font-normal">
            Learn investor-grade frameworks, earn verifiable badges, and get instant domain guidance from your AI tutor.
          </p>

          {/* AI Tutor Form */}
          <form onSubmit={handleAskAiTutor} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Bot className="absolute left-3 top-3 text-white/80 w-4 h-4" />
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask AI Tutor (e.g. How do I calculate CAC payback?)..."
                className="w-full bg-white/20 dark:bg-gray-900/80 backdrop-blur-md border border-white/35 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-indigo-100/80 focus:outline-none focus:bg-white/30 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={isAiLoading}
              className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-4 py-2.5 rounded-xl text-xs shadow flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 min-h-[40px]"
            >
              {isAiLoading ? (
                <AdaptiveSkeleton isLoading={true} className="w-3.5 h-3.5 border-2 /30 border-t-indigo-700 rounded-full" />
              ) : (
                <span>Ask AI Tutor</span>
              )}
            </button>
          </form>

          {/* AI Response Output */}
          <AnimatePresence>
            {aiResponse && (
              <motion.div 
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="mt-3.5 rounded-xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-900/50 p-3.5 text-xs text-gray-800 dark:text-gray-200 shadow-xl flex gap-3"
              >
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 h-fit shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-xs mb-1 flex items-center gap-1.5">
                    Pitchin AI Tutor Response
                    <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-semibold border border-indigo-100 dark:border-indigo-800">Verified</span>
                  </div>
                  <p className="leading-relaxed text-gray-600 dark:text-gray-300 text-xs">
                    {aiResponse}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute right-[-30px] bottom-[-30px] opacity-10 pointer-events-none hidden sm:block">
          <GraduationCap className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Main Content Layout */}
        <div className="space-y-4">
          
          {/* Category Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-hide py-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={clsx(
                    "px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all min-h-[36px]",
                    selectedCategory === category
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl pl-8 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Grid Layout: Courses (Left) + Competencies (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Courses Catalog */}
            <div className="lg:col-span-2 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                  Executive Courses ({filteredCourses.length})
                </h3>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
                  <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">No courses found</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Try selecting another domain filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredCourses.map(course => (
                    <motion.div
                      key={course.id}
                      whileHover={{ y: -2 }}
                      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold tracking-wide uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 truncate">
                            {course.category}
                          </span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {course.estimatedMinutes}m
                          </span>
                        </div>

                        <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-snug mb-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          {course.title}
                        </h4>

                        <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-3.5 line-clamp-2">
                          {course.description}
                        </p>
                      </div>

                      <div>
                        {/* Instructor Info */}
                        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 dark:border-gray-800/80 pt-2.5 mb-2.5">
                          <span className="font-medium text-gray-700 dark:text-gray-300 text-[11px]">{course.instructorName}</span>
                          <span className="text-[10px] text-gray-400">{course.instructorRole}</span>
                        </div>

                        {/* Progress or Action Button */}
                        {course.isEnrolled ? (
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-400 mb-1 font-medium">
                              <span>Progress</span>
                              <span className="font-bold text-indigo-600 dark:text-indigo-400">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mb-2.5">
                              <div 
                                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${course.progress}%` }} 
                              />
                            </div>
                            <button className="w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors flex items-center justify-center gap-1.5 min-h-[40px]">
                              <PlayCircle className="w-4 h-4" />
                              Continue Course
                            </button>
                          </div>
                        ) : (
                          <button className="w-full py-2.5 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-bold hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm min-h-[40px]">
                            Enroll in Course
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar: Proof-of-Work & Stats */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Verified Competencies
                </h3>
                
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                      <Star className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">SaaS Unit Economics</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">Validated via Progress</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Pitchin Verified Signal</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">AI Multi-Agent Systems</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">Issued July 2026</div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">Pitchin Verified Signal</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
                  Domain Stats
                </h3>
                <div className="grid grid-cols-2 gap-2.5 text-center">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">2</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Enrolled</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">1</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Certificate</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
