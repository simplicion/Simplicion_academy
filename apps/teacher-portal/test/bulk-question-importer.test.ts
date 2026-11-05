import { describe, it, expect } from 'vitest';
import { parseBulkQuestionInput } from '../src/components/cbt/BulkImporterModal';

describe('CBT Bulk Question Importer & Validator', () => {
  it('parses valid JSON questions with marking schemes accurately', () => {
    const json = JSON.stringify([
      {
        prompt: 'Which ruler is celebrated in the Prayaga Prashasti?',
        options: [
          { id: 'opt_1', text: 'Samudragupta' },
          { id: 'opt_2', text: 'Chandragupta I' },
          { id: 'opt_3', text: 'Ashoka' },
          { id: 'opt_4', text: 'Harsha' },
        ],
        correctOptionIds: ['opt_1'],
        marks: 4,
        negativeMarks: 1,
        explanation: 'Composed by Harishena in Sanskrit.',
      },
    ]);

    const results = parseBulkQuestionInput(json);
    expect(results).toHaveLength(1);
    expect(results[0].isValid).toBe(true);
    expect(results[0].question?.prompt).toBe('Which ruler is celebrated in the Prayaga Prashasti?');
    expect(results[0].question?.correctOptionIds).toEqual(['opt_1']);
    expect(results[0].question?.marks).toBe(4);
    expect(results[0].question?.negativeMarks).toBe(1);
  });

  it('detects and flags invalid JSON items missing required fields', () => {
    const invalidJson = JSON.stringify([
      {
        prompt: '', // Missing prompt!
        options: [{ id: 'opt_1', text: 'A' }],
        correctOptionIds: ['opt_1'],
      },
      {
        prompt: 'Valid question prompt?',
        options: [{ id: 'opt_1', text: 'Only One Option' }], // Less than 2 options!
        correctOptionIds: ['opt_1'],
      },
      {
        prompt: 'Another question prompt?',
        options: [
          { id: 'opt_1', text: 'A' },
          { id: 'opt_2', text: 'B' },
        ],
        correctOptionIds: [], // Missing correct answer!
      },
    ]);

    const results = parseBulkQuestionInput(invalidJson);
    expect(results).toHaveLength(3);
    expect(results[0].isValid).toBe(false);
    expect(results[0].error).toContain('Missing question prompt');

    expect(results[1].isValid).toBe(false);
    expect(results[1].error).toContain('Must contain at least 2 options');

    expect(results[2].isValid).toBe(false);
    expect(results[2].error).toContain('No correct option specified');
  });

  it('parses CSV lines into structured CBT questions with 1-based index conversion', () => {
    const csv = `
Prompt,OptionA,OptionB,OptionC,OptionD,CorrectIndex,Marks,NegMarks
Who founded the Maurya Empire?,Chandragupta Maurya,Bindusara,Ashoka,Brihadratha,1,4,1
Which script was used in Ashokan edicts in the northwest?,Aramaic & Kharosthi,Brahmi,Greek,Devanagari,1,4,1
`;

    const results = parseBulkQuestionInput(csv);
    expect(results).toHaveLength(2);
    expect(results[0].isValid).toBe(true);
    expect(results[0].question?.prompt).toBe('Who founded the Maurya Empire?');
    expect(results[0].question?.correctOptionIds).toEqual(['opt_1']);
    expect(results[0].question?.marks).toBe(4);
    expect(results[0].question?.negativeMarks).toBe(1);
  });

  it('flags malformed CSV lines with invalid correct indices', () => {
    const csv = `
Invalid Question line,Opt1,Opt2,Opt3,Opt4,99,4,1
`;

    const results = parseBulkQuestionInput(csv);
    expect(results).toHaveLength(1);
    expect(results[0].isValid).toBe(false);
    expect(results[0].error).toContain('Invalid correct option index: "99"');
  });
});

