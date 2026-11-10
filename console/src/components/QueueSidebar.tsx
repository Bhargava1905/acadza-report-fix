import React from 'react';
import { GroupedQuestionItem } from '../types';
import { Search, Flame, Users, CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react';

interface QueueSidebarProps {
  items: GroupedQuestionItem[];
  selectedId: string | null;
  onSelect: (qid: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const QueueSidebar: React.FC<QueueSidebarProps> = ({
  items,
  selectedId,
  onSelect,
  searchQuery,
  setSearchQuery,
}) => {
  const cleanSnippet = (html: string) => {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 75);
  };

  return (
    <aside className="w-full lg:w-96 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-61px)]">
      {/* Search Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search QID, chapter, formula, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
          <span>Showing <strong className="text-slate-200 font-medium">{items.length}</strong> questions</span>
          <span className="text-slate-500">Sorted by Urgency ↓</span>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
        {items.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-500 text-xs">
            No questions match your current filters.
          </div>
        ) : (
          items.map((item) => {
            const isSelected = item.question._id === selectedId;
            const qType = item.question.questionType;
            const qData = item.question[qType];
            const stem = qData?.question || '';
            
            // Urgency color styling
            let tierColor = 'bg-slate-700 text-slate-300 border-slate-600';
            if (item.urgencyTier === 'P0') tierColor = 'bg-red-500/15 text-red-300 border-red-500/30';
            else if (item.urgencyTier === 'P1') tierColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
            else if (item.urgencyTier === 'P2') tierColor = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
            else if (item.urgencyTier === 'P3') tierColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

            return (
              <div
                key={item.question._id}
                onClick={() => onSelect(item.question._id)}
                className={`p-3 rounded-lg cursor-pointer transition-all border text-left ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/40'
                    : 'bg-slate-800/40 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Top Badges Row */}
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${tierColor}`}>
                      {item.urgencyTier}
                    </span>
                    <span className="text-[11px] font-medium text-slate-300 truncate max-w-[130px]">
                      {item.question.chapter}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.reports.length > 1 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded-full">
                        <Users className="w-2.5 h-2.5" />
                        {item.reports.length}
                      </span>
                    )}

                    {item.status === 'approved' && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                        <CheckCircle className="w-2.5 h-2.5" /> Approved
                      </span>
                    )}
                    {item.status === 'rejected' && (
                      <span className="text-[10px] text-red-400 flex items-center gap-0.5 bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20">
                        <XCircle className="w-2.5 h-2.5" /> Rejected
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Stem Snippet */}
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-2">
                  {cleanSnippet(stem)}
                </p>

                {/* Bottom Tags */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.question.subject} • {qType.toUpperCase()}
                  </span>

                  {item.primaryRepair ? (
                    <span className="font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                      fix: {item.primaryRepair}
                    </span>
                  ) : (
                    <span className="text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {item.primaryVerdict}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
