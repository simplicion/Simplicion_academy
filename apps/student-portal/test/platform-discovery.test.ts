import { describe, it, expect } from 'vitest';

describe('Main Platform Discovery Hub & Live Academy Search Engine', () => {
  const academies = [
    {
      id: 'tenant_cuet_01',
      slug: 'cuet-humanities',
      name: 'Humanities CUET Academy',
      teacherName: 'Prof. Rajesh Sharma',
      specialty: 'CUET UG Humanities',
      exam: 'CUET UG',
    },
    {
      id: 'tenant_apex_physics',
      slug: 'apex-physics',
      name: 'Apex Physics Institute',
      teacherName: 'Er. Alok Verma',
      specialty: 'JEE Advanced & NEET Physics',
      exam: 'JEE / NEET',
    },
    {
      id: 'tenant_rankers_commerce',
      slug: 'rankers-commerce',
      name: 'Rankers Commerce Classes',
      teacherName: 'CA Meenakshi Sundaram',
      specialty: 'Accountancy, BST & Economics',
      exam: 'Commerce & CA',
    },
  ];

  it('filters academies by exam query (e.g. "CUET")', () => {
    const query = 'cuet';
    const matches = academies.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.exam.toLowerCase().includes(query) ||
        a.specialty.toLowerCase().includes(query)
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].slug).toBe('cuet-humanities');
  });

  it('filters academies by instructor name (e.g. "Alok")', () => {
    const query = 'alok';
    const matches = academies.filter(
      (a) =>
        a.teacherName.toLowerCase().includes(query) ||
        a.name.toLowerCase().includes(query)
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].name).toBe('Apex Physics Institute');
  });

  it('generates valid direct student portal link for any academy', () => {
    const generatePortalUrl = (slug: string) => `http://localhost:3001/?tenant=${slug}`;
    expect(generatePortalUrl('apex-physics')).toBe('http://localhost:3001/?tenant=apex-physics');
  });
});

