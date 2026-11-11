import type { ProposedEdit, Question, TriageResult } from '../types';

export type RepairDefinition = { fields: ProposedEdit['field'][]; auto: boolean; label: string };
export type Taxonomy = { repairs: Record<string, RepairDefinition> };

export type EditValidation = { valid: true } | { valid: false; reason: string };

const questionTypes = new Set(['scq', 'mcq', 'integerQuestion']);

export function fieldValue(question: Question, field: ProposedEdit['field']): string {
  if (field === 'questionType') return question.questionType;
  const detail = question[question.questionType];
  const value = detail?.[field];
  if (Array.isArray(value)) return value.join(', ');
  return String(value ?? '');
}

export function allowedFields(result: TriageResult, taxonomy: Taxonomy): ProposedEdit['field'][] {
  if (result.verdict !== 'defect' || !result.repair) return [];
  return taxonomy.repairs[result.repair]?.fields ?? [];
}

export function validateEdit(question: Question, result: TriageResult, taxonomy: Taxonomy, edit: ProposedEdit): EditValidation {
  const fields = allowedFields(result, taxonomy);
  if (fields.length === 0) return { valid: false, reason: 'This triage outcome does not permit a content edit.' };
  if (!fields.includes(edit.field)) return { valid: false, reason: `The ${result.repair} repair may only change: ${fields.join(', ')}.` };
  if (!edit.find.trim()) return { valid: false, reason: 'Enter the exact current value to replace.' };
  if (!fieldValue(question, edit.field).includes(edit.find)) return { valid: false, reason: 'The “find” value no longer matches the live record. Refresh the proposal before saving.' };
  if (edit.field === 'questionType' && !questionTypes.has(edit.replace)) return { valid: false, reason: 'Question type must be scq, mcq, or integerQuestion.' };
  return { valid: true };
}

function parseAnswer(replacement: string, wasArray: boolean): string | string[] {
  if (!wasArray) return replacement;
  try {
    const parsed = JSON.parse(replacement);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) return parsed;
  } catch {
    // A comma-separated answer is also a useful faculty input format.
  }
  return replacement.split(',').map((part) => part.trim()).filter(Boolean);
}

/** Apply an already-validated surgical edit to a local review copy. */
export function applyEdit(question: Question, edit: ProposedEdit): Question {
  if (edit.field === 'questionType') {
    const nextType = edit.replace as Question['questionType'];
    const source = question[question.questionType];
    return { ...question, questionType: nextType, [nextType]: { ...source } };
  }
  const type = question.questionType;
  const detail = question[type];
  if (!detail) return question;
  if (edit.field === 'answer') {
    const current = fieldValue(question, 'answer');
    const replaced = current.replace(edit.find, edit.replace);
    return { ...question, [type]: { ...detail, answer: parseAnswer(replaced, Array.isArray(detail.answer)) } };
  }
  const current = String(detail[edit.field] ?? '');
  return { ...question, [type]: { ...detail, [edit.field]: current.replace(edit.find, edit.replace) } };
}
