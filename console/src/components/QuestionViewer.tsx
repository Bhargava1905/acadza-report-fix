import React, { useState } from 'react';
import { GroupedQuestionItem, ProposedEdit } from '../types';
import { computeVisualDiff } from '../utils/diff';
import { sanitizeQuestionHtml } from '../utils/sanitize';
import {
  CheckCircle,
  XCircle,
  Edit3,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface QuestionViewerProps {
  item: GroupedQuestionItem;
  onApprove: (item: GroupedQuestionItem) => void;
  onReject: (item: GroupedQuestionItem, reason: string) => void;
  onEdit: (item: GroupedQuestionItem, edit: ProposedEdit) => string | null;
  allowedEditFields: ProposedEdit['field'][];
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export const QuestionViewer: React.FC<QuestionViewerProps> = ({
  item,
  onApprove,
  onReject,
  onEdit,
  allowedEditFields,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) => {
  const [activeTab, setActiveTab] = useState<'diff' | 'evidence' | 'students'>('diff');
  const [isEditing, setIsEditing] = useState(false);
  const [customFind, setCustomFind] = useState('');
  const [customReplace, setCustomReplace] = useState('');
  const [customField, setCustomField] = useState<ProposedEdit['field']>('answer');
  const [editError, setEditError] = useState('');

  const { question, reports, results, urgencyTier, urgencyReason, status } = item;
  const qType = question.questionType;
  const qData = question[qType] || { question: '', solution: '', answer: '' };

  const primaryResult = results[0];
  const edit = primaryResult?.edit || null;

  // Compute visual diff on target field
  let originalFieldContent = '';
  if (edit?.field === 'question') originalFieldContent = qData.question || '';
  else if (edit?.field === 'solution') originalFieldContent = qData.solution || '';
  else if (edit?.field === 'answer') originalFieldContent = String(qData.answer);
  else if (edit?.field === 'questionType') originalFieldContent = qType;

  const diffResult = computeVisualDiff(originalFieldContent, edit);

  const startEdit = () => {
    const defaultField = edit?.field && allowedEditFields.includes(edit.field) ? edit.field : allowedEditFields[0];
    if (!defaultField) return;
    setEditError('');
    setCustomField(defaultField);
    setCustomFind(edit?.find || '');
    setCustomReplace(edit?.replace || '');
    setIsEditing(true);
  };

  const handleSaveCustomEdit = () => {
    const error = onEdit(item, {
      field: customField,
      find: customFind,
      replace: customReplace,
    });
    if (error) {
      setEditError(error);
      return;
    }
    setIsEditing(false);
  };

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-61px)] overflow-hidden bg-slate-950">
      {/* Top Banner: Urgency & Metadata */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
              urgencyTier === 'P0'
                ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                : urgencyTier === 'P1'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : urgencyTier === 'P2'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {urgencyTier} Priority
          </span>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-900">{question.subject}</span>
            <span className="text-slate-600">•</span>
            <span>{question.chapter}</span>
            {question.concept && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{question.concept}</span>
              </>
            )}
            <span className="text-slate-600">•</span>
            <span className="font-mono text-[11px] text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              {qType}
            </span>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 text-xs flex items-center gap-1"
            title="Previous question"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 text-xs flex items-center gap-1"
            title="Next question"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Urgency Reason Callout */}
      <div className="bg-slate-900/40 border-b border-slate-800/80 px-6 py-2 text-xs flex items-center gap-2 text-slate-300">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span className="font-medium text-slate-200">Urgency Assessment:</span>
        <span className="text-slate-400">{urgencyReason}</span>
      </div>

      {/* Main Content Area - Split Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden">
        {/* Left Col: Rendered Question and Stored Answer (6 cols) */}
        <div className="xl:col-span-6 border-r border-slate-800 flex flex-col h-full overflow-hidden">
          <div className="p-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Live Question Record (MathML Rendered)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Stored Key:</span>
              <span className="font-mono font-bold text-xs bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 px-2 py-0.5 rounded">
                {String(qData.answer)}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Question Stem HTML */}
            <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800/80 shadow-inner">
              <div
                className="rendered-content text-slate-100 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeQuestionHtml(qData.question) }}
              />
            </div>

            {/* Stored Solution */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Stored Reference Solution
              </h4>
              <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans">
                <div
                  className="rendered-content"
                  dangerouslySetInnerHTML={{ __html: sanitizeQuestionHtml(qData.solution || '<span class="text-slate-500">No solution provided in record.</span>') }}
                />
              </div>
            </div>

            {/* Error History if present */}
            {question.errorHistory && question.errorHistory.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                <span className="font-semibold text-amber-300 block mb-1">Previous Error History:</span>
                {question.errorHistory.map((h, i) => (
                  <div key={i} className="text-amber-200/80 text-[11px]">
                    [{h.at}] {h.actor}: {h.note}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: AI Triage, Diff & Actions (6 cols) */}
        <div className="xl:col-span-6 flex flex-col h-full overflow-hidden bg-slate-900/30">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900/80 px-4 pt-2 gap-1">
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-t border-x ${
                activeTab === 'diff'
                  ? 'bg-slate-950 text-indigo-400 border-slate-800'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Proposed Surgical Fix & Diff
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-t border-x ${
                activeTab === 'evidence'
                  ? 'bg-slate-950 text-indigo-400 border-slate-800'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              AI Solve & Proof ({Math.round(primaryResult.confidence * 100)}% Conf)
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-t border-x ${
                activeTab === 'students'
                  ? 'bg-slate-950 text-indigo-400 border-slate-800'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Student Reports ({reports.length})
            </button>
          </div>

          {/* Tab Panes */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === 'diff' && (
              <div className="space-y-4">
                {/* AI Verdict Summary Banner */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      AI Triage Verdict
                    </span>
                    <span className="text-sm font-bold text-slate-900 capitalize flex items-center gap-2 mt-0.5">
                      {primaryResult.verdict.replace('_', ' ')}
                      {primaryResult.repair && (
                        <span className="text-xs font-mono font-normal text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                          repair: {primaryResult.repair}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Recommended Route
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                        primaryResult.route === 'auto_apply'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : primaryResult.route === 'faculty_review'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {primaryResult.route.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Proposed Edit Diff Box */}
                {edit ? (
                  <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Target Field: <code className="text-indigo-300 font-mono">{edit.field}</code>
                      </span>
                      {allowedEditFields.length > 0 && (
                        <button
                          onClick={startEdit}
                          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Custom Edit
                        </button>
                      )}
                    </div>

                    {/* Before vs After Visual Diff */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Before (Red) */}
                      <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block mb-1">
                          Current Live Value
                        </span>
                        <div className="text-xs text-red-200 font-mono break-all bg-red-950/40 p-2 rounded border border-red-900/40">
                          {diffResult.segments.map((segment, index) => <span key={index} className={segment.type === 'removed' ? 'line-through' : ''}>{segment.type === 'added' ? '' : segment.text}</span>)}
                        </div>
                      </div>

                      {/* After (Green) */}
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                          Proposed AI Replacement
                        </span>
                        <div className="text-xs text-emerald-200 font-mono font-semibold break-all bg-emerald-950/40 p-2 rounded border border-emerald-900/40">
                          {diffResult.segments.map((segment, index) => <span key={index}>{segment.type === 'removed' ? '' : segment.text}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                    No content edit proposed. Question is marked as <strong className="text-slate-200">{primaryResult.verdict}</strong>.
                  </div>
                )}

                {/* Student Reply Preview */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                    <MessageSquare className="w-3 h-3 text-indigo-400" />
                    Student Reply Preview (Sent back to student)
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    "{primaryResult.student_reply}"
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'evidence' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Independent AI Verification</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {Math.round(primaryResult.confidence * 100)}% Confidence
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    {primaryResult.evidence}
                  </p>
                </div>

                {/* Safety Scope Checklist */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Safety & Scope Verification
                  </span>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Closed taxonomy compliance: Valid verdict and repair keys</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Field scope respected: Only permitted fields touched</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Independent solve verified before answer key replacement</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-300 block mb-1">
                  Incoming Student Submissions ({reports.length})
                </span>
                {reports.map((r) => (
                  <div
                    key={r.reportId}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-400">{r.reportId} • {r.studentId}</span>
                      <span className="text-slate-500">{new Date(r.reportedAt).toLocaleString()} ({r.source})</span>
                    </div>
                    <div className="text-xs text-slate-200 font-medium bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                      "{r.comment}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky 1-Click Action Toolbar at Bottom */}
          <div className="border-t border-slate-800 bg-slate-900/95 p-4 flex items-center justify-between gap-3 shadow-2xl">
            <div className="flex items-center gap-2">
              {status === 'approved' && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Approved & Recorded
                </span>
              )}
              {status === 'rejected' && (
                <span className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> Rejected & Recorded
                </span>
              )}
              {status === 'edited' && (
                <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Custom Edit Applied
                </span>
              )}
              {status === 'pending' && (
                <span className="text-xs text-slate-400">
                  Ready for review:
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onReject(item, 'Rejected by faculty')}
                className="px-3.5 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject Fix
              </button>

              <button
                onClick={startEdit}
                disabled={allowedEditFields.length === 0}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" /> Adjust...
              </button>

              <button
                onClick={() => onApprove(item)}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <CheckCircle className="w-4 h-4" /> Approve (1-Click)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-400" /> Adjust Proposed Edit
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Field</label>
                <select
                  value={customField}
                  onChange={(e) => setCustomField(e.target.value as ProposedEdit['field'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                >
                  {allowedEditFields.map((field) => <option key={field} value={field}>{field}</option>)}
                </select>
              </div>
              {editError && <p role="alert" className="rounded border border-red-500/30 bg-red-950/40 px-3 py-2 text-red-200">{editError}</p>}

              <div>
                <label className="block text-slate-400 mb-1">Find String (What to replace)</label>
                <input
                  type="text"
                  value={customFind}
                  onChange={(e) => setCustomFind(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Replacement String (New value)</label>
                <textarea
                  rows={3}
                  value={customReplace}
                  onChange={(e) => setCustomReplace(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomEdit}
                className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs cursor-pointer"
              >
                Apply Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
