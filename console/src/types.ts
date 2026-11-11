export interface QuestionDetail {
  question: string;
  solution: string;
  answer: string | string[];
  quesImages?: string[];
  solutionImages?: string[];
}

export interface Question {
  _id: string;
  qid?: string | null;
  questionType: 'scq' | 'mcq' | 'integerQuestion';
  subject: string;
  chapter: string;
  concept?: string | null;
  subConcept?: string | null;
  level?: string | null;
  error?: number;
  updatedAt?: string;
  scq?: QuestionDetail;
  mcq?: QuestionDetail;
  integerQuestion?: QuestionDetail;
  errorHistory?: Array<{
    type: string;
    actor: string;
    at: string;
    note: string;
  }>;
}

export interface Report {
  reportId: string;
  questionId: string;
  studentId: string;
  source: 'web' | 'android' | 'ios';
  reportedAt: string;
  comment: string;
}

export interface ProposedEdit {
  field: 'question' | 'solution' | 'answer' | 'questionType';
  find: string;
  replace: string;
}

export type QuestionStatus = 'pending' | 'approved' | 'rejected' | 'edited';

export interface TriageResult {
  reportId: string;
  questionId: string;
  verdict: 'defect' | 'no_error' | 'display_issue' | 'app_issue' | 'language_mode' | 'already_fixed' | 'not_actionable';
  repair: string | null;
  edit: ProposedEdit | null;
  route: 'auto_apply' | 'faculty_review' | 'no_change';
  confidence: number;
  evidence: string;
  student_reply: string;
}

export interface AuditRecord {
  id: string;
  questionId: string;
  reportIds: string[];
  action: 'approved' | 'rejected' | 'custom_edited';
  actor: string;
  timestamp: string;
  originalEdit?: ProposedEdit | null;
  appliedEdit?: ProposedEdit | null;
  note?: string;
}

export interface GroupedQuestionItem {
  question: Question;
  reports: Report[];
  results: TriageResult[];
  urgencyScore: number;
  urgencyTier: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  urgencyReason: string;
  primaryVerdict: string;
  primaryRepair: string | null;
  primaryRoute: string;
  status: QuestionStatus;
}
