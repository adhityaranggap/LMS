import { useEffect, useRef, useCallback, useState } from 'react';

export interface AntiCheatData {
  timePerQuestion: Record<string, number>;
  tabSwitchCount: number;
  copyEvents: number;
  pasteEvents: number;
  keystrokeIntervals: Record<string, number[]>;
  totalTimeMs: number;
}

export function useAntiCheat() {
  const startTime = useRef(Date.now());
  const tabSwitchCount = useRef(0);
  const copyEvents = useRef(0);
  const pasteEvents = useRef(0);
  const questionTimes = useRef<Record<string, number>>({});
  const keystrokeIntervals = useRef<Record<string, number[]>>({});
  const lastKeystrokeTime = useRef<Record<string, number>>({});
  const currentQuestionId = useRef<string | null>(null);
  const questionStartTime = useRef(Date.now());
  const [showTabWarning, setShowTabWarning] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCount.current++;
        setShowTabWarning(true);
        setTimeout(() => setShowTabWarning(false), 5000);
      }
    };

    const handleCopy = () => { copyEvents.current++; };
    const handlePaste = () => { pasteEvents.current++; };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const setActiveQuestion = useCallback((questionId: string) => {
    if (currentQuestionId.current && currentQuestionId.current !== questionId) {
      const elapsed = Date.now() - questionStartTime.current;
      questionTimes.current[currentQuestionId.current] =
        (questionTimes.current[currentQuestionId.current] || 0) + elapsed;
    }
    currentQuestionId.current = questionId;
    questionStartTime.current = Date.now();
  }, []);

  const recordKeystroke = useCallback((questionId: string) => {
    const now = Date.now();
    const last = lastKeystrokeTime.current[questionId];
    if (last) {
      if (!keystrokeIntervals.current[questionId]) {
        keystrokeIntervals.current[questionId] = [];
      }
      keystrokeIntervals.current[questionId].push(now - last);
    }
    lastKeystrokeTime.current[questionId] = now;
  }, []);

  const getAntiCheatData = useCallback((): AntiCheatData => {
    // Finalize current question time
    if (currentQuestionId.current) {
      const elapsed = Date.now() - questionStartTime.current;
      questionTimes.current[currentQuestionId.current] =
        (questionTimes.current[currentQuestionId.current] || 0) + elapsed;
    }

    return {
      timePerQuestion: { ...questionTimes.current },
      tabSwitchCount: tabSwitchCount.current,
      copyEvents: copyEvents.current,
      pasteEvents: pasteEvents.current,
      keystrokeIntervals: { ...keystrokeIntervals.current },
      totalTimeMs: Date.now() - startTime.current,
    };
  }, []);

  return {
    setActiveQuestion,
    recordKeystroke,
    getAntiCheatData,
    showTabWarning,
    tabSwitchCount: tabSwitchCount.current,
  };
}
