import { Report, TriageResult, Question } from '../types';

export function calculateUrgency(
  question: Question,
  reports: Report[],
  results: TriageResult[]
): { score: number; tier: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'; reason: string } {
  let baseScore = 10;
  let primaryReason = 'Routine student submission';

  const repairs = results.map(r => r.repair).filter(Boolean);
  const verdicts = results.map(r => r.verdict);

  if (repairs.includes('answer_key')) {
    baseScore = 90;
    primaryReason = 'Wrong or malformed answer key directly hurts student test scores';
  } else if (repairs.includes('unsound') || repairs.includes('identical_options')) {
    baseScore = 80;
    primaryReason = 'Unsound question or repeating options prevent unambiguous answering';
  } else if (repairs.includes('option_repair') || repairs.includes('type_mismatch')) {
    baseScore = 75;
    primaryReason = 'Missing option or question type mismatch breaks grading';
  } else if (repairs.includes('wrong_question') || repairs.includes('diagram')) {
    baseScore = 65;
    primaryReason = 'Missing diagram or mismatched solution disrupts conceptual learning';
  } else if (repairs.includes('stem_data') || repairs.includes('solution_fix')) {
    baseScore = 55;
    primaryReason = 'Missing numerical value in stem or calculation slip in solution';
  } else if (repairs.includes('spelling') || repairs.includes('markup_leak') || repairs.includes('exam_reference') || repairs.includes('answer_form')) {
    baseScore = 40;
    primaryReason = 'Cosmetic typo, LaTeX tag leak, or missing unit spec';
  } else if (repairs.includes('wrong_chapter') || repairs.includes('syllabus')) {
    baseScore = 35;
    primaryReason = 'Categorization or syllabus scope confirmation required';
  } else if (verdicts.includes('display_issue') || verdicts.includes('app_issue')) {
    baseScore = 20;
    primaryReason = 'Platform / device rendering glitch, content is valid';
  } else if (verdicts.includes('already_fixed')) {
    baseScore = 15;
    primaryReason = 'Reported issue already resolved in live record';
  } else {
    baseScore = 10;
    primaryReason = 'Question verified correct; student error or invalid report';
  }

  // Volume multiplier: Each additional report indicates amplified student impact
  const reportCountBonus = Math.min((reports.length - 1) * 12, 24);
  const totalScore = baseScore + reportCountBonus;

  let tier: 'P0' | 'P1' | 'P2' | 'P3' | 'P4' = 'P3';
  if (totalScore >= 85) tier = 'P0';
  else if (totalScore >= 70) tier = 'P1';
  else if (totalScore >= 50) tier = 'P2';
  else if (totalScore >= 30) tier = 'P3';
  else tier = 'P4';

  if (reports.length > 1) {
    primaryReason += ` (${reports.length} students reported this)`;
  }

  return {
    score: totalScore,
    tier,
    reason: primaryReason
  };
}
