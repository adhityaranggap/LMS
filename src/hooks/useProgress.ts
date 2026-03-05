import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

interface ModuleSummary {
  moduleId: number;
  visitedTabs: string[];
  labStepsCompleted: number;
  labSubmitted: boolean;
  caseSubmitted: boolean;
  quizAttempts: number;
  bestScore: number | null;
}

export function useProgressSummary() {
  const [summary, setSummary] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    api<{ summary: Record<string, any> }>('/api/progress/summary')
      .then(data => {
        const modules: ModuleSummary[] = Object.entries(data.summary).map(([key, val]) => ({
          moduleId: Number(key),
          visitedTabs: val.visitedTabs || [],
          labStepsCompleted: val.labStepsCompleted || 0,
          labSubmitted: val.labSubmitted || false,
          caseSubmitted: val.caseSubmitted || false,
          quizAttempts: val.quizAttempts || 0,
          bestScore: val.quizBestScore ?? null,
        }));
        setSummary(modules);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { summary, loading, refresh };
}

export function useLabSteps(moduleId: number) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    api<{ completedSteps: number[] }>(`/api/progress/lab-steps/${moduleId}`)
      .then(data => setCompletedSteps(data.completedSteps))
      .catch(() => {});
  }, [moduleId]);

  const toggleStep = async (stepIndex: number) => {
    const completed = !completedSteps.includes(stepIndex);
    try {
      await api('/api/progress/lab-step', {
        method: 'POST',
        body: JSON.stringify({ moduleId, stepIndex, completed }),
      });
      setCompletedSteps(prev =>
        completed ? [...prev, stepIndex] : prev.filter(s => s !== stepIndex)
      );
    } catch {}
  };

  return { completedSteps, toggleStep };
}

export function useQuizAttempts(moduleId: number) {
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    api<{ attempts: any[] }>(`/api/progress/quiz-attempts/${moduleId}`)
      .then(data => setAttempts(data.attempts))
      .catch(() => {});
  }, [moduleId]);

  return { attempts, setAttempts };
}

export function useCaseSubmission(moduleId: number) {
  const [submission, setSubmission] = useState<any>(null);

  useEffect(() => {
    api<{ submission: any }>(`/api/progress/case-submission/${moduleId}`)
      .then(data => setSubmission(data.submission))
      .catch(() => {});
  }, [moduleId]);

  return { submission, setSubmission };
}

export function recordVisit(moduleId: number, tab: string) {
  api('/api/progress/visit', {
    method: 'POST',
    body: JSON.stringify({ moduleId, tab }),
  }).catch(() => {});
}
