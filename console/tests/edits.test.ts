import assert from 'node:assert/strict';
import { applyEdit, fieldValue, validateEdit } from '../src/utils/edits.ts';

const taxonomy = {
  repairs: {
    answer_key: { fields: ['answer', 'solution'], auto: true, label: 'Answer key' },
    spelling: { fields: ['question', 'solution'], auto: true, label: 'Spelling' },
    diagram: { fields: [], auto: false, label: 'Diagram' },
  },
};

const question = {
  _id: 'q1',
  questionType: 'mcq' as const,
  subject: 'Physics',
  chapter: 'Test',
  mcq: { question: 'Pick A, B, D', solution: 'Old explanation', answer: ['A, B, D'] },
};

const result = {
  reportId: 'R020', questionId: 'q1', verdict: 'defect' as const, repair: 'answer_key',
  edit: null, route: 'auto_apply' as const, confidence: 0.99, evidence: 'proof', student_reply: 'reply',
};

const repair = { field: 'answer' as const, find: 'A, B, D', replace: '["A", "B", "D"]' };
assert.deepEqual(validateEdit(question, result, taxonomy, repair), { valid: true });
const applied = applyEdit(question, repair);
assert.deepEqual(applied.mcq?.answer, ['A', 'B', 'D']);
assert.equal(fieldValue(applied, 'answer'), 'A, B, D');

const scopeBreach = { field: 'questionType' as const, find: 'mcq', replace: 'scq' };
assert.equal(validateEdit(question, result, taxonomy, scopeBreach).valid, false);
const stalePatch = { field: 'answer' as const, find: 'C', replace: 'D' };
assert.equal(validateEdit(question, result, taxonomy, stalePatch).valid, false);
const noEditResult = { ...result, repair: 'diagram', route: 'faculty_review' as const };
assert.equal(validateEdit(question, noEditResult, taxonomy, repair).valid, false);

console.log('PASS edits: scope, stale-target and answer-array protections');
