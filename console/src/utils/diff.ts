import { ProposedEdit } from '../types';

export interface DiffSegment {
  type: 'unchanged' | 'removed' | 'added';
  text: string;
}

export function computeVisualDiff(originalText: string, edit: ProposedEdit | null): {
  hasDiff: boolean;
  beforeHtml: string;
  afterHtml: string;
  segments: DiffSegment[];
} {
  if (!edit || !edit.find) {
    return {
      hasDiff: false,
      beforeHtml: originalText,
      afterHtml: originalText,
      segments: [{ type: 'unchanged', text: originalText }]
    };
  }

  const { find, replace } = edit;

  if (!originalText.includes(find)) {
    // Exact find not found verbatim in originalText (e.g. if field is 'answer')
    return {
      hasDiff: true,
      beforeHtml: `<span class="bg-red-500/20 text-red-300 line-through px-1.5 py-0.5 rounded font-mono">${escapeHtml(find)}</span>`,
      afterHtml: `<span class="bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.5 rounded font-mono">${escapeHtml(replace)}</span>`,
      segments: [
        { type: 'removed', text: find },
        { type: 'added', text: replace }
      ]
    };
  }

  // Split original text around the find target (first occurrence)
  const idx = originalText.indexOf(find);
  const beforePrefix = originalText.slice(0, idx);
  const beforeSuffix = originalText.slice(idx + find.length);

  const beforeHtml = `${beforePrefix}<mark class="bg-red-500/30 text-red-200 line-through rounded px-1">${find}</mark>${beforeSuffix}`;
  const afterHtml = `${beforePrefix}<mark class="bg-emerald-500/30 text-emerald-200 font-semibold rounded px-1">${replace}</mark>${beforeSuffix}`;

  return {
    hasDiff: true,
    beforeHtml,
    afterHtml,
    segments: [
      { type: 'unchanged', text: beforePrefix },
      { type: 'removed', text: find },
      { type: 'added', text: replace },
      { type: 'unchanged', text: beforeSuffix }
    ]
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
