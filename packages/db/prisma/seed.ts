import { TenantAggregate } from '@simplicion/tenant';
import { OfferingAggregate } from '@simplicion/catalog';
import { Question } from '@simplicion/assessment';
import { UserAggregate } from '@simplicion/identity';

export interface SeedPayload {
  tenant: TenantAggregate;
  teacher: UserAggregate;
  offerings: OfferingAggregate[];
  questions: Question[];
}

export function generateSeedData(): SeedPayload {
  // 1. Reference Tenant: Humanities CUET Academy
  const tenant = TenantAggregate.create(
    'tenant_cuet_01',
    'cuet-humanities',
    'Humanities CUET Academy',
    'teacher_rajesh_01',
    'plan_pro',
    {
      branding: {
        tagline: 'Premier Humanities Coaching for CUET UG Entrance Exam',
        primaryColor: '#2563eb',
        accentColor: '#3b82f6',
        borderRadius: 'md',
        fontFamily: 'Inter',
        headerLayout: 'login-left',
      },
      labels: {
        studyEntry: 'Study Hub',
        unitsHeader: "Let's Study",
        offeringName: 'Batch',
      },
    }
  );
  tenant.publish();
  tenant.attachCustomDomain('cuethumanities.in', true);

  // 2. Teacher Educator
  const teacher = new UserAggregate({
    id: 'teacher_rajesh_01',
    tenantId: tenant.id,
    phone: '+919876543210',
    name: 'Dr. Rajesh Varma',
    email: 'rajesh@cuethumanities.in',
    role: 'teacher',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 3. Batches
  const foundationBatch = OfferingAggregate.create(
    'off_cuet_foundation_2027',
    tenant.id,
    'cat_humanities',
    'CUET 2027: Humanities Foundation Batch',
    'cuet-2027-humanities-foundation',
    'batch',
    'Complete 1-year live & recorded coverage for History, Political Science, Geography & Economics.',
    {
      mrp: 9999,
      salePrice: 4999,
      currency: 'INR',
    }
  );
  foundationBatch.publish();
  foundationBatch.addUnit('Bricks, Beads and Bones - The Harappan Civilisation', 'harappan-civilisation');
  foundationBatch.addUnit('Kings, Farmers and Towns - Early States and Economies', 'early-states');

  const crashCourse = OfferingAggregate.create(
    'off_cuet_crash_2026',
    tenant.id,
    'cat_humanities',
    'CUET History Domain Intensive Crash Course',
    'cuet-history-crash',
    'batch',
    'Rapid revision batch covering themes in Indian History with 500+ NTA CUET practice questions.',
    {
      mrp: 3999,
      salePrice: 1999,
      currency: 'INR',
    }
  );
  crashCourse.publish();

  // 4. CBT Assessment Questions
  const questions: Question[] = [
    {
      id: 'q_seed_01',
      unitId: 'harappan-civilisation',
      tenantId: tenant.id,
      type: 'single_choice',
      prompt: 'Which of the following Harappan sites is renowned for sophisticated stone-cut water reservoirs?',
      promptHindi: 'निम्नलिखित में से कौन सा हड़प्पा स्थल उन्नत पत्थर के बने जल जलाशयों के लिए प्रसिद्ध है?',
      options: [
        { id: 'opt_1', text: 'Dholavira', textHindi: 'धोलावीरा' },
        { id: 'opt_2', text: 'Kalibangan', textHindi: 'कालीबंगा' },
        { id: 'opt_3', text: 'Lothal', textHindi: 'लोथल' },
        { id: 'opt_4', text: 'Banawali', textHindi: 'बनावली' },
      ],
      correctOptionIds: ['opt_1'],
      marks: 4,
      negativeMarks: 1,
      explanation: 'Dholavira in the Rann of Kutch had sophisticated water harvesting structures and rock-cut reservoirs.',
    },
    {
      id: 'q_seed_02',
      unitId: 'early-states',
      tenantId: tenant.id,
      type: 'single_choice',
      prompt: 'Who deciphered the Brahmi and Kharosthi scripts in 1838, unlocking earliest Ashokan inscriptions?',
      promptHindi: '1838 में अशोक के प्रारंभिक शिलालेखों में प्रयुक्त ब्राह्मी और खरोष्ठी लिपियों को किसने पढ़ा था?',
      options: [
        { id: 'opt_1', text: 'James Prinsep', textHindi: 'जेम्स प्रिंसेप' },
        { id: 'opt_2', text: 'Alexander Cunningham', textHindi: 'अलेक्जेंडर कनिंघम' },
        { id: 'opt_3', text: 'John Marshall', textHindi: 'जॉन मार्शल' },
        { id: 'opt_4', text: 'Mortimer Wheeler', textHindi: 'मोर्टिमर व्हीलर' },
      ],
      correctOptionIds: ['opt_1'],
      marks: 4,
      negativeMarks: 1,
      explanation: 'James Prinsep, an officer in the mint of the East India Company, deciphered Brahmi in 1838.',
    },
  ];

  return {
    tenant,
    teacher,
    offerings: [foundationBatch, crashCourse],
    questions,
  };
}

export async function runSeed(): Promise<SeedPayload> {
  const data = generateSeedData();
  console.log(`[Database Seed] Successfully generated seed payload for tenant: "${data.tenant.name}" (${data.tenant.slug})`);
  console.log(`[Database Seed] Offerings seeded: ${data.offerings.length}`);
  console.log(`[Database Seed] CBT Questions seeded: ${data.questions.length}`);
  return data;
}

if (require.main === module) {
  runSeed().catch((err) => {
    console.error('[Database Seed Error]:', err);
    process.exit(1);
  });
}

