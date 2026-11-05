import { TenantAggregate } from '@simplicion/tenant';
import { OfferingAggregate } from '@simplicion/catalog';

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  description: string;
  count: number;
}

export interface FaqData {
  question: string;
  answer: string;
}

export interface WhyUsFeature {
  title: string;
  description: string;
  icon: string;
}

/**
 * Loads Reference Tenant (Humanities CUET) matching PRD Section 9
 */
export function loadReferenceTenant() {
  const tenant = TenantAggregate.create(
    'tenant-cuet-ref',
    'cuet',
    'Humanities CUET Academy',
    'usr-teacher-01',
    'plan-pro',
    {
      branding: {
        tagline: 'Humanities walon, tum kisi se kam nahi',
        primaryColor: '#1e3a8a', // Deep Academic Navy
        accentColor: '#f59e0b', // Scholarly Amber
        borderRadius: 'lg',
        fontFamily: 'Noto Sans Devanagari',
        headerLayout: 'login-left', // PRD Section 9: Login on the left of header
      },
      labels: {
        studyEntry: 'Study',
        unitsHeader: "Let's Study",
        offeringName: 'Batch',
      },
      sectionsOrder: ['hero', 'upcoming-slider', 'categories', 'why-us', 'faq'],
      contact: {
        supportPhone: '+91 98765 43210',
        whatsappNumber: '919876543210',
        whatsappTemplate: 'Hi sir, my name is {name}. I recently joined the {offering} batch. Please add me to the group.',
      },
      seo: {
        titleTemplate: 'Humanities CUET Academy | Best Online Classes for CUET UG Humanities',
        metaDescription: 'Target DU North Campus with Humanities CUET Academy. Daily live classes, bilingual notes, CBT mock tests, and mentorship for CUET UG.',
        keywords: ['CUET Humanities', 'CUET UG 2027', 'Political Science CUET', 'History CUET', 'DU Admissions'],
      },
    }
  );

  const categories: CategoryData[] = [
    { id: 'cat-1', name: 'CUET UG', slug: 'cuet', isActive: true, description: 'Comprehensive domain and general test preparation for Central Universities.', count: 2 },
    { id: 'cat-2', name: 'Class 12', slug: 'class-12', isActive: false, description: 'Board exam mastery and NCERT deep-dive.', count: 0 },
    { id: 'cat-3', name: 'Class 11', slug: 'class-11', isActive: false, description: 'Foundation building for senior secondary humanities.', count: 0 },
    { id: 'cat-4', name: 'Class 10', slug: 'class-10', isActive: false, description: 'Social Science and core board preparation.', count: 0 },
    { id: 'cat-5', name: 'Class 9', slug: 'class-9', isActive: false, description: 'Early conceptual clarity.', count: 0 },
    { id: 'cat-6', name: 'IPU CET', slug: 'ipu', isActive: false, description: 'Guru Gobind Singh Indraprastha University entrance prep.', count: 0 },
    { id: 'cat-7', name: 'ITEP', slug: 'itep', isActive: false, description: 'Integrated Teacher Education Programme training.', count: 0 },
    { id: 'cat-8', name: 'Govt Exams', slug: 'govt-exams', isActive: false, description: 'General awareness and state service foundations.', count: 0 },
  ];

  const foundationOffering = OfferingAggregate.create(
    'off-cuet-01',
    tenant.id,
    'cat-1',
    'CUET UG Foundation Batch 2027',
    'cuet-ug-foundation-2027',
    'batch',
    'The ultimate full-year mentorship and live batch for CUET UG aspirants targeting St. Stephen’s, Hindu, SRCC, Miranda House, and North Campus.',
    {
      mrp: 8000,
      salePrice: 4000,
      currency: 'INR',
    },
    'bilingual'
  );
  foundationOffering.addFeature('video', 'Daily Live & Recorded Classes');
  foundationOffering.addFeature('file-text', 'Chapter-wise Notes & Mindmaps');
  foundationOffering.addFeature('clock', 'Full-Length CBT Mocks every Sunday');
  foundationOffering.addFeature('book-open', 'PYQs 2022 to Latest Solved');
  foundationOffering.addFeature('message-circle', 'Dedicated Doubt Support Sessions');
  foundationOffering.addFeature('users', 'One-on-One Mentorship & Admission Guidance');
  foundationOffering.addFeature('share-2', 'Private Student WhatsApp Group Access');

  foundationOffering.addUnit('English Language', 'english');
  foundationOffering.addUnit('Political Science', 'political-science');
  foundationOffering.addUnit('History', 'history');
  foundationOffering.addUnit('Geography', 'geography');
  foundationOffering.addUnit('Legal Studies', 'legal-studies');
  foundationOffering.addUnit('Sociology', 'sociology');
  foundationOffering.addUnit('General Aptitude Test (GAT)', 'gat');
  foundationOffering.publish();

  const crashCourseOffering = OfferingAggregate.create(
    'off-cuet-02',
    tenant.id,
    'cat-1',
    'CUET UG Crash Course 2027',
    'cuet-ug-crash-course-2027',
    'course',
    'Fast-track intensive syllabus revision batch with high-yield questions (Free with Foundation Batch via Entitlement).',
    {
      mrp: 3500,
      salePrice: 0,
      currency: 'INR',
    },
    'bilingual'
  );
  crashCourseOffering.addFeature('zap', 'High-Speed 45-Day Revision');
  crashCourseOffering.addFeature('target', 'Top 500 Predicted MCQs');
  crashCourseOffering.addUnit('Domain Quick Revision', 'domain-revision');
  crashCourseOffering.addUnit('GAT Booster', 'gat-booster');
  crashCourseOffering.publish();

  const faqs: FaqData[] = [
    {
      question: 'Is the teaching bilingual (Hindi + English)?',
      answer: 'Yes! All classes, slides, and notes are provided in English and explained in bilingual Hindi/English so every student understands effortlessly.',
    },
    {
      question: 'What is the schedule for Sunday CBT Mock Tests?',
      answer: 'Every Sunday at 10:00 AM, a full-length NTA CUET-pattern CBT mock test unlocks with a live timer, negative marking, and detailed answer analysis.',
    },
    {
      question: 'Do I get the Crash Course free if I join Foundation Batch?',
      answer: 'Yes! Enrolling in the CUET UG Foundation Batch automatically entitles you to 100% free access to our CUET Crash Course 2027.',
    },
    {
      question: 'How do I join the private WhatsApp community?',
      answer: 'Once enrolled, a "Join WhatsApp Community" button will appear on your Study Hub that pre-fills your student name and batch details.',
    },
  ];

  const whyUs: WhyUsFeature[] = [
    {
      title: 'North Campus Proven Pedagogy',
      description: 'Structured systematically around NCERT line-by-line breakdown and NTA test patterns.',
      icon: 'award',
    },
    {
      title: 'Authentic CBT Simulator',
      description: 'Get familiar with the real examination interface before exam day with timer pressure and palette navigation.',
      icon: 'monitor',
    },
    {
      title: 'Personalized Doubt Support',
      description: 'Submit your queries directly to subject mentors with fast turnaround and live weekly doubt-clearing sessions.',
      icon: 'help-circle',
    },
    {
      title: 'College Preference Guidance',
      description: 'Post-exam advisory tools and preference list creation to maximize your admission chances into top colleges.',
      icon: 'compass',
    },
  ];

  return {
    tenant,
    categories,
    offerings: [foundationOffering, crashCourseOffering],
    faqs,
    whyUs,
  };
}

