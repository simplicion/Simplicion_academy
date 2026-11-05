import { describe, it, expect } from 'vitest';
import { SubjectNode, UnitNode, ContentItem } from '../src/components/batches/CurriculumTree';

describe('Batch & Curriculum Tree Manager', () => {
  it('constructs a nested Subject -> Unit -> Content hierarchy cleanly', () => {
    const unit1: UnitNode = {
      id: 'u-1',
      title: 'Unit 1: Bricks, Beads and Bones',
      order: 1,
      items: [
        {
          id: 'c-1',
          type: 'video',
          title: 'Urban Architecture of Mohenjo-Daro',
          durationOrPages: '45 mins',
        },
        {
          id: 'c-2',
          type: 'notes',
          title: 'Harappan Archaeology Summary Notes',
          durationOrPages: '16 pages',
          allowDownload: false,
        },
        {
          id: 'c-3',
          type: 'cbt',
          title: 'Daily Practice Paper 01',
          durationOrPages: '25 Qs',
        },
      ],
    };

    const subject: SubjectNode = {
      id: 'sub-history',
      title: 'History: Themes in Indian History Part 1',
      units: [unit1],
    };

    expect(subject.units).toHaveLength(1);
    expect(subject.units[0].items).toHaveLength(3);
    expect(subject.units[0].items[0].type).toBe('video');
    expect(subject.units[0].items[1].allowDownload).toBe(false);
  });

  it('allows adding a new content item without mutating sibling units', () => {
    const subjects: SubjectNode[] = [
      {
        id: 'sub-history',
        title: 'Themes in Indian History',
        units: [
          {
            id: 'u-1',
            title: 'Unit 1: Harappan Civilisation',
            order: 1,
            items: [],
          },
          {
            id: 'u-2',
            title: 'Unit 2: Early States and Economies',
            order: 2,
            items: [],
          },
        ],
      },
    ];

    const newItem: ContentItem = {
      id: 'c-new',
      type: 'video',
      title: 'The Mauryan Administration Lecture',
      durationOrPages: '50 mins',
    };

    // Add into Unit 2
    const targetUnitId = 'u-2';
    const updated = subjects.map((sub) => ({
      ...sub,
      units: sub.units.map((u) => (u.id === targetUnitId ? { ...u, items: [...u.items, newItem] } : u)),
    }));

    expect(updated[0].units[0].items).toHaveLength(0);
    expect(updated[0].units[1].items).toHaveLength(1);
    expect(updated[0].units[1].items[0].title).toBe('The Mauryan Administration Lecture');
  });

  it('handles item deletion properly', () => {
    const unit: UnitNode = {
      id: 'u-1',
      title: 'Unit 1',
      order: 1,
      items: [
        { id: 'c-1', type: 'video', title: 'Video 1' },
        { id: 'c-2', type: 'notes', title: 'Notes 1' },
      ],
    };

    const remaining = unit.items.filter((item) => item.id !== 'c-1');
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('c-2');
  });
});

