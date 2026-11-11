import React from 'react';
import { AuditRecord } from '../types';
import { History, Download, X, CheckCircle, XCircle, Edit3 } from 'lucide-react';

interface AuditModalProps {
  records: AuditRecord[];
  onClose: () => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({ records, onClose }) => {
  const downloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `faculty_audit_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900">Faculty Audit Trail ({records.length} Actions)</h2>
          </div>
          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <button
                onClick={downloadJson}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {records.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No review decisions recorded yet in this session.
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {rec.action === 'approved' && (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Approved
                      </span>
                    )}
                    {rec.action === 'rejected' && (
                      <span className="text-red-400 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    )}
                    {rec.action === 'custom_edited' && (
                      <span className="text-indigo-400 font-semibold flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5" /> Custom Edit Applied
                      </span>
                    )}
                    <span className="text-slate-400 font-mono text-[11px]">QID: {rec.questionId}</span>
                  </div>

                  <span className="text-slate-500 text-[10px]">
                    {new Date(rec.timestamp).toLocaleTimeString()} by {rec.actor}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Associated Reports: <span className="font-mono text-slate-300">{rec.reportIds.join(', ')}</span>
                </div>

                {rec.appliedEdit && (
                  <div className="bg-slate-900 p-2 rounded text-[11px] font-mono border border-slate-800 text-slate-300">
                    <div>field: {rec.appliedEdit.field}</div>
                    <div className="text-red-400">- {rec.appliedEdit.find}</div>
                    <div className="text-emerald-400">+ {rec.appliedEdit.replace}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
