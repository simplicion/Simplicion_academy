export interface HeroHighlightItem {
  title: string;
  subtitle: string;
}

export interface WhyUsItem {
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface WebsiteSectionContent {
  hero: {
    visible: boolean;
    badgeText: string;
    headline: string;
    tagline: string;
    description: string;
    primaryCtaText: string;
    secondaryCtaText: string;
    heroImageUrl: string;
    highlights: HeroHighlightItem[];
  };
  courses: {
    visible: boolean;
    badgeText: string;
    heading: string;
    subtitle: string;
  };
  showcase: {
    visible: boolean;
    badgeText: string;
    heading: string;
    description: string;
    imageUrl: string;
    bullets: string[];
  };
  whyUs: {
    visible: boolean;
    heading: string;
    subtitle: string;
    features: WhyUsItem[];
  };
  faqs: {
    visible: boolean;
    badgeText: string;
    heading: string;
    subtitle: string;
    items: FaqItem[];
  };
}

export interface AcademyProfileData {
  academyName: string;
  slug: string;
  tagline: string;
  logoUrl: string;
  bannerUrl: string;
  educatorName: string;
  educatorTitle: string;
  category: string;
  establishedYear: string;
  languages: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  address: string;
  city: string;
  supportHours: string;
  youtubeUrl: string;
  instagramUrl: string;
  telegramUrl: string;
  websiteUrl: string;
  gstin: string;
  policyNote: string;
}

export const BRAND_COLOR_SWATCHES = [
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Deep Teal', hex: '#0f766e' },
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Warm Amber', hex: '#d97706' },
  { name: 'Indigo Slate', hex: '#4f46e5' },
  { name: 'Obsidian', hex: '#0f172a' },
];

export const ACADEMY_CATEGORIES = [
  'General / Multi-Disciplinary',
  'School & Board Coaching',
  'Competitive & Entrance Exams',
  'Coding & Technology',
  'Business, Commerce & Finance',
  'Design, Creative & Arts',
  'Languages & Communication',
  'Skills & Professional Training',
];

export const DEFAULT_WEBSITE_CONTENT: WebsiteSectionContent = {
  hero: {
    visible: true,
    badgeText: 'Admissions Open • Live & Self-Paced Programs',
    headline: 'Learn with Clarity, Consistency & Guidance',
    tagline: 'Structured online courses, interactive live classes, and direct educator support.',
    description:
      'Explore well-organized lessons, curated study notes, practice tests, and real-time doubt resolution designed to help every learner build lasting mastery.',
    primaryCtaText: 'Explore Courses',
    secondaryCtaText: '',
    heroImageUrl: '/images/hero-academy.svg',
    highlights: [
      { title: 'Structured Syllabus', subtitle: 'Subject & lesson roadmap' },
      { title: 'Live & Recorded', subtitle: 'Watch live or revise anytime' },
      { title: 'Practice Tests', subtitle: 'Instant scorecards & review' },
      { title: 'Direct Mentorship', subtitle: 'Fast lesson-level doubt replies' },
    ],
  },
  courses: {
    visible: true,
    badgeText: 'Featured Programs',
    heading: 'Explore Our Courses',
    subtitle:
      'Enroll securely for instant access to organized subjects, live sessions, study documents, live classroom chat, and assessments.',
  },
  showcase: {
    visible: true,
    badgeText: 'Inside the Classroom',
    heading: 'Everything You Need to Learn in One Focused Space',
    description:
      'No scattered links or cluttered feeds. Every enrolled learner gets a clean classroom with video lessons, downloadable study resources, live interactive chat, and tracked progress.',
    imageUrl: '/images/showcase-classroom.svg',
    bullets: [
      'Organized subjects, lessons, and topics with completion tracking',
      'Live classes with instant notifications and recorded session archives',
      'Ask doubts right inside any lesson and receive direct educator replies',
      'Lesson-wise and full-subject tests with immediate performance breakdown',
    ],
  },
  whyUs: {
    visible: true,
    heading: 'Why Learners Choose Our Academy',
    subtitle:
      'Built around clear instruction, disciplined practice, and personal educator accountability.',
    features: [
      {
        title: 'Concept-First Teaching',
        description:
          'Every topic is broken down step-by-step with clear notes, visual explanations, and reference links.',
      },
      {
        title: 'Interactive Live Sessions',
        description:
          'Join scheduled or instant live classes with real-time chat and attached class handouts.',
      },
      {
        title: 'Continuous Assessment',
        description:
          'Practice quizzes and full-subject tests with objective and written questions keep preparation on track.',
      },
      {
        title: 'Dedicated Doubt Support',
        description:
          'Raise questions on any lesson and receive timely replies directly inside your classroom and notifications.',
      },
    ],
  },
  faqs: {
    visible: true,
    badgeText: 'Help & Answers',
    heading: 'Frequently Asked Questions',
    subtitle: 'Common questions about enrolling, accessing classes, notes, and educator support.',
    items: [
      {
        question: 'How do I enroll and start accessing a course?',
        answer:
          'Simply sign in using the Login button in the header, choose your course, and complete enrollment. Your student classroom unlocks immediately.',
      },
      {
        question: 'Can I watch recordings if I miss a live class?',
        answer:
          'Yes. All live classes can be archived directly into your course lessons alongside any attached notes and document links so you can revise anytime.',
      },
      {
        question: 'How do I ask doubts to the educator?',
        answer:
          'Inside your course classroom, switch to the Ask a Doubt tab while watching any lesson. Your educator sees the exact lesson context and replies directly to your classroom and notifications.',
      },
      {
        question: 'Are practice tests included with the courses?',
        answer:
          'Yes. Lesson-specific quizzes and full-subject tests created by your educator appear automatically inside your course curriculum with instant scorecards.',
      },
    ],
  },
};

export const DEFAULT_ACADEMY_PROFILE: AcademyProfileData = {
  academyName: 'Learnings Simplicion',
  slug: '',
  tagline: '',
  logoUrl: '',
  bannerUrl: '',
  educatorName: '',
  educatorTitle: '',
  category: '',
  establishedYear: '',
  languages: '',
  supportEmail: '',
  supportPhone: '',
  whatsappNumber: '',
  address: '',
  city: '',
  supportHours: '',
  youtubeUrl: '',
  instagramUrl: '',
  telegramUrl: '',
  websiteUrl: '',
  gstin: '',
  policyNote: '',
};

export function mergeWebsiteContent(raw?: Partial<WebsiteSectionContent> | null): WebsiteSectionContent {
  if (!raw || typeof raw !== 'object') return DEFAULT_WEBSITE_CONTENT;
  const rawSecondaryCta = raw.hero?.secondaryCtaText;
  const sanitizedSecondaryCta =
    typeof rawSecondaryCta === 'string' && rawSecondaryCta.trim().toLowerCase() === 'take practice test'
      ? ''
      : rawSecondaryCta;

  return {
    hero: {
      ...DEFAULT_WEBSITE_CONTENT.hero,
      ...(raw.hero || {}),
      secondaryCtaText:
        sanitizedSecondaryCta !== undefined
          ? sanitizedSecondaryCta
          : DEFAULT_WEBSITE_CONTENT.hero.secondaryCtaText,
      highlights:
        Array.isArray(raw.hero?.highlights) && raw.hero.highlights.length > 0
          ? raw.hero.highlights
          : DEFAULT_WEBSITE_CONTENT.hero.highlights,
    },
    courses: {
      ...DEFAULT_WEBSITE_CONTENT.courses,
      ...(raw.courses || {}),
    },
    showcase: {
      ...DEFAULT_WEBSITE_CONTENT.showcase,
      ...(raw.showcase || {}),
      bullets:
        Array.isArray(raw.showcase?.bullets) && raw.showcase.bullets.length > 0
          ? raw.showcase.bullets
          : DEFAULT_WEBSITE_CONTENT.showcase.bullets,
    },
    whyUs: {
      ...DEFAULT_WEBSITE_CONTENT.whyUs,
      ...(raw.whyUs || {}),
      features:
        Array.isArray(raw.whyUs?.features) && raw.whyUs.features.length > 0
          ? raw.whyUs.features
          : DEFAULT_WEBSITE_CONTENT.whyUs.features,
    },
    faqs: {
      ...DEFAULT_WEBSITE_CONTENT.faqs,
      ...(raw.faqs || {}),
      items:
        Array.isArray(raw.faqs?.items) && raw.faqs.items.length > 0
          ? raw.faqs.items
          : DEFAULT_WEBSITE_CONTENT.faqs.items,
    },
  };
}

export function mergeAcademyProfile(
  tenantName?: string,
  slug?: string,
  branding?: Record<string, any>,
  contact?: Record<string, any>
): AcademyProfileData {
  return {
    ...DEFAULT_ACADEMY_PROFILE,
    academyName: tenantName || DEFAULT_ACADEMY_PROFILE.academyName,
    slug: slug || DEFAULT_ACADEMY_PROFILE.slug,
    tagline: branding?.tagline || DEFAULT_ACADEMY_PROFILE.tagline,
    logoUrl: branding?.logoUrl || '',
    bannerUrl: branding?.bannerUrl || '',
    ...(contact || {}),
  };
}

/**
 * Applies the academy's single chosen brand accent color across the entire Student Landing Page & Student Portal.
 */
export function applyBrandColorTokens(hexColor?: string | null) {
  if (typeof document === 'undefined' || !hexColor || !/^#[0-9a-fA-F]{6}$/.test(hexColor)) {
    return;
  }
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', hexColor);
  root.style.setProperty('--brand-primary-soft', `${hexColor}14`);
  root.style.setProperty('--brand-primary-border', `${hexColor}38`);
}
