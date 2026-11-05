import { describe, it, expect } from 'vitest';
import { TenantAggregate } from '@simplicion/tenant';
import { OfferingAggregate } from '@simplicion/catalog';
import { OrderAggregate } from '@simplicion/commerce';
import { UserAggregate } from '@simplicion/identity';
import { Question } from '@simplicion/assessment';
import { computeCbtScore } from '../../student-portal/test/cbt-engine.test';
import { generateWatermarkString } from '../../student-portal/test/watermarking.test';
import { computeSplitSettlement } from '../../admin-portal/test/split-settlement.test';

describe('Cross-Application End-to-End Multi-Tenant Lifecycle', () => {
  it('executes complete journey: Tenant Onboarding -> Storefront Design -> Checkout -> Split Webhook -> Study Hub & CBT Assessment -> Payout Ledger', () => {
    // -------------------------------------------------------------------------
    // Phase 1: Super Admin approves new Tenant Onboarding
    // -------------------------------------------------------------------------
    const tenant = TenantAggregate.create(
      'tenant_cuet_e2e',
      'cuet-humanities',
      'Humanities CUET Academy',
      'teacher_rajesh_01',
      'plan_pro'
    );
    expect(tenant.status).toBe('draft');

    tenant.publish();
    expect(tenant.status).toBe('active');
    expect(tenant.slug).toBe('cuet-humanities');

    // -------------------------------------------------------------------------
    // Phase 2: Teacher Portal: Studio branding & Batch creation
    // -------------------------------------------------------------------------
    tenant.updateBranding({
      primaryColor: '#2563eb',
      accentColor: '#3b82f6',
      borderRadius: 'md',
      fontFamily: 'Inter',
      headerLayout: 'login-left',
    });
    expect(tenant.settings.branding.primaryColor).toBe('#2563eb');
    expect(tenant.settings.branding.headerLayout).toBe('login-left');

    const batch = OfferingAggregate.create(
      'off_cuet_foundation_2027',
      tenant.id,
      'cat_humanities',
      'CUET 2027: Humanities Foundation Batch',
      'cuet-2027-humanities-foundation',
      'batch',
      '1-year complete prep for CUET Humanities',
      {
        mrp: 9999,
        salePrice: 4999,
        currency: 'INR',
      }
    );
    expect(batch.pricing.salePrice).toBe(4999);
    expect(batch.pricing.mrp).toBe(9999);
    expect(batch.discountPercent).toBe(50);

    // -------------------------------------------------------------------------
    // Phase 3: Student Identity & Authentication
    // -------------------------------------------------------------------------
    const student = UserAggregate.createStudent(
      'std_rahul_101',
      tenant.id,
      '+919876543210',
      'Rahul Sharma'
    );
    expect(student.phone).toBe('+919876543210');
    expect(student.name).toBe('Rahul Sharma');

    // -------------------------------------------------------------------------
    // Phase 4: Order Creation & Razorpay Route Split Webhook Execution
    // -------------------------------------------------------------------------
    const order = OrderAggregate.create(
      'ord_e2e_9841',
      tenant.id,
      student.id,
      batch.id,
      batch.pricing.salePrice,
      3, // 3% Platform Fee (Pro Plan)
      'rzp_order_live_9841'
    );
    expect(order.status).toBe('pending');

    // Split Settlement math verification
    const split = computeSplitSettlement(order.split.grossAmount, 3.0);
    expect(split.platformFee).toBe(150);
    expect(split.teacherPayout).toBe(4849);
    expect(split.platformFee + split.teacherPayout).toBe(4999);

    // Gateway webhook marks order as paid
    order.markPaid('pay_rzp_live_capture_9841', ['off_crash_free_bonus']);
    expect(order.status).toBe('paid');
    expect(order.grantedOfferingIds).toContain(batch.id);
    expect(order.grantedOfferingIds).toContain('off_crash_free_bonus'); // Bonus course granted!

    // -------------------------------------------------------------------------
    // Phase 5: Student Study Hub: Watermarked Document Viewer
    // -------------------------------------------------------------------------
    const watermarkText = generateWatermarkString(
      student.name!,
      student.phone,
      '2026-11-05'
    );
    expect(watermarkText).toBe('Rahul Sharma • +919876543210 • 2026-11-05');

    // -------------------------------------------------------------------------
    // Phase 6: Student takes NTA CUET CBT Exam
    // -------------------------------------------------------------------------
    const questions: Question[] = [
      {
        id: 'q1',
        unitId: 'u1',
        tenantId: tenant.id,
        type: 'single_choice',
        prompt: 'Which Harappan site had unique water reservoirs?',
        options: [
          { id: 'opt_1', text: 'Dholavira' },
          { id: 'opt_2', text: 'Lothal' },
        ],
        correctOptionIds: ['opt_1'],
        marks: 4,
        negativeMarks: 1,
      },
      {
        id: 'q2',
        unitId: 'u1',
        tenantId: tenant.id,
        type: 'single_choice',
        prompt: 'Who deciphered Ashokan Brahmi in 1838?',
        options: [
          { id: 'opt_3', text: 'James Prinsep' },
          { id: 'opt_4', text: 'John Marshall' },
        ],
        correctOptionIds: ['opt_3'],
        marks: 4,
        negativeMarks: 1,
      },
    ];

    const answers = {
      q1: ['opt_1'], // Correct: +4
      q2: ['opt_3'], // Correct: +4
    };

    const scorecard = computeCbtScore(questions, answers);
    expect(scorecard.attempted).toBe(2);
    expect(scorecard.correct).toBe(2);
    expect(scorecard.incorrect).toBe(0);
    expect(scorecard.totalMarks).toBe(8);
    expect(scorecard.accuracyPercent).toBe(100);

    // -------------------------------------------------------------------------
    // Verification: Tenant isolation enforced
    // -------------------------------------------------------------------------
    expect(batch.tenantId).toBe(tenant.id);
    expect(order.tenantId).toBe(tenant.id);
  });
});
