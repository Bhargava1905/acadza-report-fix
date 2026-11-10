import React from 'react';
import { ShieldCheck, Flame, Filter, CheckCircle2, AlertTriangle, History, Moon } from 'lucide-react';

interface HeaderProps {
  stats: {
    totalQuestions: number;
    totalReports: number;
    pendingReview: number;
    p0Count: number;
    autoApplied: number;
    auditedCount: number;
  };
  filterSubject: string;
  setFilterSubject: (subj: string) => void;
  filterTier: string;
  setFilterTier: (tier: string) => void;
  filterRoute: string;
  setFilterRoute: (route: string) => void;
  onOpenAudit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  filterSubject,
  setFilterSubject,
  filterTier,
  setFilterTier,
  filterRoute,
  setFilterRoute,
  onOpenAudit,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 sticky top-0 z-30 shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">Acadza Faculty Console</h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Report → Fix
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                <Moon className="w-3 h-3 text-amber-400" />
                <span>10 PM Fast-Review Mode</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Safe AI triage & surgical repairs for ~8 lakh JEE/NEET questions
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-300">
            <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="font-semibold">{stats.p0Count}</span>
            <span className="text-red-400/80">Critical (P0)</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">{stats.pendingReview}</span>
            <span className="text-amber-400/80">Needs Faculty</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">{stats.autoApplied}</span>
            <span className="text-emerald-400/80">Safe Auto-applied</span>
          </div>

          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Audit Trail</span>
            {stats.auditedCount > 0 && (
              <span className="bg-indigo-600 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full">
                {stats.auditedCount}
              </span>
            )}
          </button>
        </div>

        {/* Global Filters */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Urgencies</option>
            <option value="P0">P0 (Critical Key Defects)</option>
            <option value="P1">P1 (High - Missing Options)</option>
            <option value="P2">P2 (Medium - Stem/Diagram)</option>
            <option value="P3">P3 (Routine - Typos/Markup)</option>
            <option value="P4">P4 (No Content Change)</option>
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Botany">Botany</option>
            <option value="Zoology">Zoology</option>
          </select>

          <select
            value={filterRoute}
            onChange={(e) => setFilterRoute(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Routes</option>
            <option value="faculty_review">Faculty Review</option>
            <option value="auto_apply">Auto-Applied</option>
            <option value="no_change">No Change</option>
          </select>
        </div>
      </div>
    </header>
  );
};
