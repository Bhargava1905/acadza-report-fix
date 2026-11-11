import React, { useState, useEffect, useMemo } from 'react';
import { Question, Report, TriageResult, GroupedQuestionItem, AuditRecord, ProposedEdit, QuestionStatus } from './types';
import { calculateUrgency } from './utils/urgency';
import { allowedFields, applyEdit, Taxonomy, validateEdit } from './utils/edits';
import { Header } from './components/Header';
import { QueueSidebar } from './components/QueueSidebar';
import { QuestionViewer } from './components/QuestionViewer';
import { AuditModal } from './components/AuditModal';

// Static Data Imports
import rawQuestions from './data/questions.json';
import rawReports from './data/reports.json';
import rawResults from './data/results.json';
import rawTaxonomy from './data/taxonomy.json';

export const App: React.FC = () => {
  const [selectedQid, setSelectedQid] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterTier, setFilterTier] = useState('ALL');
  const [filterRoute, setFilterRoute] = useState('ALL');
  const [liveQuestions, setLiveQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('acadza_live_questions');
      return saved ? JSON.parse(saved) : (rawQuestions as Question[]);
    } catch {
      return rawQuestions as Question[];
    }
  });
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(() => {
    try {
      const saved = localStorage.getItem('acadza_faculty_audit');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [statusMap, setStatusMap] = useState<Record<string, QuestionStatus>>(() => {
    try {
      // Versioned after fixing the old UI's unsafe implicit "approved" status.
      const saved = localStorage.getItem('acadza_question_status_v2');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Group raw data by questionId
  const allGroupedItems: GroupedQuestionItem[] = useMemo(() => {
    const qMap = new Map<string, Question>();
    liveQuestions.forEach((q) => qMap.set(q._id, q));

    const reportsMap = new Map<string, Report[]>();
    (rawReports as Report[]).forEach((r) => {
      const list = reportsMap.get(r.questionId) || [];
      list.push(r);
      reportsMap.set(r.questionId, list);
    });

    const resultsMap = new Map<string, TriageResult[]>();
    (rawResults as TriageResult[]).forEach((res) => {
      const list = resultsMap.get(res.questionId) || [];
      list.push(res);
      resultsMap.set(res.questionId, list);
    });

    // We focus on questions that have student reports
    const grouped: GroupedQuestionItem[] = [];

    reportsMap.forEach((reports, qid) => {
      const question = qMap.get(qid);
      if (!question) return;

      const results = resultsMap.get(qid) || [];
      const { score, tier, reason } = calculateUrgency(question, reports, results);

      const primaryResult = results[0];
      const primaryVerdict = primaryResult?.verdict || 'defect';
      const primaryRepair = primaryResult?.repair || null;
      const primaryRoute = primaryResult?.route || 'faculty_review';

      grouped.push({
        question,
        reports,
        results,
        urgencyScore: score,
        urgencyTier: tier,
        urgencyReason: reason,
        primaryVerdict,
        primaryRepair,
        primaryRoute,
        // An AI recommendation is never a faculty approval. Every item starts pending
        // until a recorded decision is made in this console.
        status: statusMap[qid] || 'pending',
      });
    });

    // Sort by Urgency Score Descending
    return grouped.sort((a, b) => b.urgencyScore - a.urgencyScore);
  }, [liveQuestions, statusMap]);

  // Apply User Filters & Search
  const filteredItems = useMemo(() => {
    return allGroupedItems.filter((item) => {
      if (filterSubject !== 'ALL' && item.question.subject !== filterSubject) {
        return false;
      }
      if (filterTier !== 'ALL' && item.urgencyTier !== filterTier) {
        return false;
      }
      if (filterRoute !== 'ALL' && item.primaryRoute !== filterRoute) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const qidMatch = item.question._id.toLowerCase().includes(q);
        const chapterMatch = item.question.chapter.toLowerCase().includes(q);
        const commentMatch = item.reports.some((r) => r.comment.toLowerCase().includes(q));
        const stemMatch = (item.question[item.question.questionType]?.question || '')
          .toLowerCase()
          .includes(q);
        if (!qidMatch && !chapterMatch && !commentMatch && !stemMatch) {
          return false;
        }
      }
      return true;
    });
  }, [allGroupedItems, filterSubject, filterTier, filterRoute, searchQuery]);

  // Set initial selected question
  useEffect(() => {
    if (!selectedQid && filteredItems.length > 0) {
      setSelectedQid(filteredItems[0].question._id);
    } else if (selectedQid && !filteredItems.find((i) => i.question._id === selectedQid)) {
      if (filteredItems.length > 0) {
        setSelectedQid(filteredItems[0].question._id);
      } else {
        setSelectedQid(null);
      }
    }
  }, [filteredItems, selectedQid]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        navigateNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        navigatePrev();
      } else if (e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'r') {
        const keyboardItem = filteredItems.find((item) => item.question._id === selectedQid);
        if (keyboardItem) {
          e.preventDefault();
          if (e.key.toLowerCase() === 'a') handleApprove(keyboardItem);
          else handleReject(keyboardItem, 'Rejected by faculty via keyboard shortcut');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedQid]);

  const currentIndex = filteredItems.findIndex((i) => i.question._id === selectedQid);
  const currentItem = filteredItems[currentIndex] || null;

  const navigatePrev = () => {
    if (currentIndex > 0) {
      setSelectedQid(filteredItems[currentIndex - 1].question._id);
    }
  };

  const navigateNext = () => {
    if (currentIndex >= 0 && currentIndex < filteredItems.length - 1) {
      setSelectedQid(filteredItems[currentIndex + 1].question._id);
    }
  };

  // Action handlers
  const handleApprove = (item: GroupedQuestionItem) => {
    const proposedEdit = item.results[0]?.edit;
    if (proposedEdit) {
      const validation = validateEdit(item.question, item.results[0], rawTaxonomy as Taxonomy, proposedEdit);
      if (!validation.valid) {
        window.alert(`Cannot approve this proposal: ${'reason' in validation ? validation.reason : 'invalid edit'}`);
        return;
      }
      setLiveQuestions((current) => {
        const next = current.map((question) => question._id === item.question._id ? applyEdit(question, proposedEdit) : question);
        localStorage.setItem('acadza_live_questions', JSON.stringify(next));
        return next;
      });
    }
    const newStatusMap = { ...statusMap, [item.question._id]: 'approved' as const };
    setStatusMap(newStatusMap);
    localStorage.setItem('acadza_question_status_v2', JSON.stringify(newStatusMap));

    const newRecord: AuditRecord = {
      id: `AUDIT_${Date.now()}`,
      questionId: item.question._id,
      reportIds: item.reports.map((r) => r.reportId),
      action: 'approved',
      actor: 'Faculty',
      timestamp: new Date().toISOString(),
      originalEdit: proposedEdit,
      appliedEdit: proposedEdit,
    };

    const newAudit = [newRecord, ...auditRecords];
    setAuditRecords(newAudit);
    localStorage.setItem('acadza_faculty_audit', JSON.stringify(newAudit));

    // Fast-forward to next question
    navigateNext();
  };

  const handleReject = (item: GroupedQuestionItem, reason: string) => {
    const newStatusMap = { ...statusMap, [item.question._id]: 'rejected' as const };
    setStatusMap(newStatusMap);
    localStorage.setItem('acadza_question_status_v2', JSON.stringify(newStatusMap));

    const newRecord: AuditRecord = {
      id: `AUDIT_${Date.now()}`,
      questionId: item.question._id,
      reportIds: item.reports.map((r) => r.reportId),
      action: 'rejected',
      actor: 'Faculty',
      timestamp: new Date().toISOString(),
      note: reason,
    };

    const newAudit = [newRecord, ...auditRecords];
    setAuditRecords(newAudit);
    localStorage.setItem('acadza_faculty_audit', JSON.stringify(newAudit));

    navigateNext();
  };

  const handleCustomEdit = (item: GroupedQuestionItem, edit: ProposedEdit): string | null => {
    const validation = validateEdit(item.question, item.results[0], rawTaxonomy as Taxonomy, edit);
    if (!validation.valid) return 'reason' in validation ? validation.reason : 'Invalid edit.';

    setLiveQuestions((current) => {
      const next = current.map((question) => question._id === item.question._id ? applyEdit(question, edit) : question);
      localStorage.setItem('acadza_live_questions', JSON.stringify(next));
      return next;
    });
    const newStatusMap = { ...statusMap, [item.question._id]: 'edited' as const };
    setStatusMap(newStatusMap);
    localStorage.setItem('acadza_question_status_v2', JSON.stringify(newStatusMap));

    const newRecord: AuditRecord = {
      id: `AUDIT_${Date.now()}`,
      questionId: item.question._id,
      reportIds: item.reports.map((r) => r.reportId),
      action: 'custom_edited',
      actor: 'Faculty',
      timestamp: new Date().toISOString(),
      originalEdit: item.results[0]?.edit,
      appliedEdit: edit,
    };

    const newAudit = [newRecord, ...auditRecords];
    setAuditRecords(newAudit);
    localStorage.setItem('acadza_faculty_audit', JSON.stringify(newAudit));
    return null;
  };

  // Header stats
  const stats = useMemo(() => {
    const p0Count = allGroupedItems.filter((i) => i.urgencyTier === 'P0').length;
    const pendingReview = allGroupedItems.filter((i) => i.status === 'pending').length;
    const autoApplySuggested = allGroupedItems.filter((i) => i.primaryRoute === 'auto_apply').length;
    const approvedCount = allGroupedItems.filter((i) => i.status === 'approved').length;
    return {
      totalQuestions: liveQuestions.length,
      totalReports: rawReports.length,
      pendingReview,
      p0Count,
      autoApplySuggested,
      approvedCount,
      auditedCount: auditRecords.length,
    };
  }, [allGroupedItems, auditRecords, liveQuestions.length]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Header
        stats={stats}
        filterSubject={filterSubject}
        setFilterSubject={setFilterSubject}
        filterTier={filterTier}
        setFilterTier={setFilterTier}
        filterRoute={filterRoute}
        setFilterRoute={setFilterRoute}
        onOpenAudit={() => setIsAuditModalOpen(true)}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <QueueSidebar
          items={filteredItems}
          selectedId={selectedQid}
          onSelect={(qid) => setSelectedQid(qid)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {currentItem ? (
          <QuestionViewer
            item={currentItem}
            onApprove={handleApprove}
            onReject={handleReject}
            onEdit={handleCustomEdit}
            allowedEditFields={allowedFields(currentItem.results[0], rawTaxonomy as Taxonomy)}
            onPrev={navigatePrev}
            onNext={navigateNext}
            hasPrev={currentIndex > 0}
            hasNext={currentIndex < filteredItems.length - 1}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 text-slate-500 text-sm">
            Select a question from the queue on the left.
          </div>
        )}
      </div>

      {isAuditModalOpen && (
        <AuditModal
          records={auditRecords}
          onClose={() => setIsAuditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
