import db from '../db';
import { logger } from './logger';

export interface AntiCheatData {
  timePerQuestion?: Record<string, number>;
  tabSwitchCount?: number;
  copyEvents?: number;
  pasteEvents?: number;
  keystrokeIntervals?: Record<string, number[]>;
  totalTimeMs?: number;
}

interface FraudFlagInput {
  tenant_id?: number;
  user_id: string;
  flag_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, unknown>;
}

const insertFlag = db.prepare(`
  INSERT INTO fraud_flags (tenant_id, user_id, flag_type, severity, resource_type, resource_id, details)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

export function createFraudFlag(flag: FraudFlagInput): void {
  try {
    insertFlag.run(
      flag.tenant_id ?? 1,
      flag.user_id,
      flag.flag_type,
      flag.severity,
      flag.resource_type ?? null,
      flag.resource_id ?? null,
      flag.details ? JSON.stringify(flag.details) : null,
    );
  } catch (e) {
    logger.error('Failed to create fraud flag', { tag: 'fraud', error: String(e) });
  }
}

export function analyzeSubmission(
  userId: string,
  submissionType: 'quiz' | 'case_study',
  submissionId: number,
  antiCheatData: AntiCheatData | undefined,
  tenantId: number = 1,
): void {
  if (!antiCheatData) return;

  const resourceType = submissionType === 'quiz' ? 'quiz_attempt' : 'case_study_submission';
  const resourceId = String(submissionId);

  // Check rapid submission (< 30 seconds total time)
  if (antiCheatData.totalTimeMs !== undefined && antiCheatData.totalTimeMs < 30000) {
    createFraudFlag({
      tenant_id: tenantId,
      user_id: userId,
      flag_type: 'rapid_submission',
      severity: 'high',
      resource_type: resourceType,
      resource_id: resourceId,
      details: { totalTimeMs: antiCheatData.totalTimeMs },
    });
  }

  // Check tab switches (> 3)
  if (antiCheatData.tabSwitchCount !== undefined && antiCheatData.tabSwitchCount > 3) {
    createFraudFlag({
      tenant_id: tenantId,
      user_id: userId,
      flag_type: 'tab_switch',
      severity: antiCheatData.tabSwitchCount > 10 ? 'high' : 'medium',
      resource_type: resourceType,
      resource_id: resourceId,
      details: { tabSwitchCount: antiCheatData.tabSwitchCount },
    });
  }

  // Check paste events on answers
  if (antiCheatData.pasteEvents !== undefined && antiCheatData.pasteEvents > 0) {
    createFraudFlag({
      tenant_id: tenantId,
      user_id: userId,
      flag_type: 'copy_paste',
      severity: antiCheatData.pasteEvents > 3 ? 'high' : 'medium',
      resource_type: resourceType,
      resource_id: resourceId,
      details: { pasteEvents: antiCheatData.pasteEvents, copyEvents: antiCheatData.copyEvents },
    });
  }

  // Check keystroke anomalies (few keystrokes + long text)
  if (antiCheatData.keystrokeIntervals) {
    for (const [questionId, intervals] of Object.entries(antiCheatData.keystrokeIntervals)) {
      if (intervals.length < 5) {
        createFraudFlag({
          tenant_id: tenantId,
          user_id: userId,
          flag_type: 'keystroke_anomaly',
          severity: 'medium',
          resource_type: resourceType,
          resource_id: resourceId,
          details: { questionId, keystrokeCount: intervals.length },
        });
      }
    }
  }

  // Check identical answers across students (Jaccard similarity)
  if (submissionType === 'quiz') {
    checkIdenticalAnswers(userId, submissionId, tenantId);
  }
}

function checkIdenticalAnswers(userId: string, attemptId: number, tenantId: number): void {
  try {
    const currentAttempt = db.prepare(
      'SELECT module_id, answers FROM quiz_attempts WHERE id = ?'
    ).get(attemptId) as { module_id: number; answers: string } | undefined;

    if (!currentAttempt) return;

    let currentAnswers: Record<string, string>;
    try {
      currentAnswers = JSON.parse(currentAttempt.answers);
    } catch {
      return;
    }

    // Get recent attempts from other students for the same module
    const recentAttempts = db.prepare(`
      SELECT student_id, answers FROM quiz_attempts
      WHERE module_id = ? AND student_id != ? AND tenant_id = ?
      ORDER BY submitted_at DESC LIMIT 50
    `).all(currentAttempt.module_id, userId, tenantId) as { student_id: string; answers: string }[];

    for (const other of recentAttempts) {
      let otherAnswers: Record<string, string>;
      try {
        otherAnswers = JSON.parse(other.answers);
      } catch {
        continue;
      }

      const similarity = jaccardSimilarity(currentAnswers, otherAnswers);
      if (similarity > 0.8) {
        createFraudFlag({
          tenant_id: tenantId,
          user_id: userId,
          flag_type: 'identical_answers',
          severity: 'critical',
          resource_type: 'quiz_attempt',
          resource_id: String(attemptId),
          details: { similarity, otherStudentId: other.student_id },
        });
        break;
      }
    }
  } catch (e) {
    logger.error('Identical answer check error', { tag: 'fraud', error: String(e) });
  }
}

function jaccardSimilarity(a: Record<string, string>, b: Record<string, string>): number {
  const keysA = new Set(Object.keys(a));
  const keysB = new Set(Object.keys(b));
  const allKeys = new Set([...keysA, ...keysB]);
  if (allKeys.size === 0) return 0;

  let matching = 0;
  for (const key of allKeys) {
    if (a[key] && b[key] && a[key].trim().toLowerCase() === b[key].trim().toLowerCase()) {
      matching++;
    }
  }
  return matching / allKeys.size;
}
