import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, HelpCircle, Send, RefreshCw, AlertTriangle } from 'lucide-react';
import { QuizQuestion } from '../data/syllabus';
import { api } from '../lib/api';
import { useQuizAttempts } from '../hooks/useProgress';
import { useAntiCheat } from '../hooks/useAntiCheat';
import clsx from 'clsx';

interface QuizProps {
  questions: QuizQuestion[];
  moduleId: number;
}

export const Quiz: React.FC<QuizProps> = ({ questions, moduleId }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [mcCorrect, setMcCorrect] = useState(0);
  const [mcTotal, setMcTotal] = useState(0);
  const { attempts } = useQuizAttempts(moduleId);
  const { setActiveQuestion, recordKeystroke, getAntiCheatData, showTabWarning } = useAntiCheat();

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900">No Quiz Available</h3>
        <p className="text-slate-500 mt-2">There is no quiz for this module yet.</p>
      </div>
    );
  }

  const handleOptionSelect = (questionId: number, option: string) => {
    if (isSubmitted) return;
    setActiveQuestion(String(questionId));
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleTextChange = (questionId: number, text: string) => {
    if (isSubmitted) return;
    setActiveQuestion(String(questionId));
    recordKeystroke(String(questionId));
    setAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let correctCount = 0;
    let scorableQuestions = 0;
    questions.forEach(q => {
      if (q.type === 'multiple-choice') {
        scorableQuestions++;
        if (answers[q.id] === q.answer) correctCount++;
      }
    });

    const finalScore = scorableQuestions > 0 ? Math.round((correctCount / scorableQuestions) * 100) : 100;
    setScore(finalScore);
    setMcCorrect(correctCount);
    setMcTotal(scorableQuestions);
    setIsSubmitted(true);

    try {
      const antiCheatData = getAntiCheatData();
      await api('/api/progress/quiz-submit', {
        method: 'POST',
        body: JSON.stringify({
          moduleId,
          answers: JSON.stringify(answers),
          antiCheatData,
        }),
      });
    } catch {}
  };

  const handleReset = () => {
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  const hasMultipleChoice = questions.some(q => q.type === 'multiple-choice');

  return (
    <div className="space-y-6">
      {/* Tab Switch Warning */}
      {showTabWarning && !isSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Perpindahan tab terdeteksi</p>
            <p className="text-xs text-amber-600 mt-0.5">Aktivitas ini dicatat dan akan dilaporkan ke dosen.</p>
          </div>
        </motion.div>
      )}

      {/* Previous Attempts */}
      {attempts.length > 0 && !isSubmitted && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Previous Attempts</h3>
          <div className="space-y-2">
            {attempts.map((a: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-sm text-slate-600">
                  Attempt {idx + 1} — {new Date(a.submitted_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-3">
                  {a.mc_total > 0 && (
                    <span className="text-sm font-medium text-slate-700">
                      MC: {a.mc_correct}/{a.mc_total}
                    </span>
                  )}
                  <span className={clsx(
                    "text-sm font-bold px-2 py-0.5 rounded",
                    a.score >= 80 ? "text-emerald-700 bg-emerald-50" :
                    a.score >= 60 ? "text-amber-700 bg-amber-50" :
                    "text-red-700 bg-red-50"
                  )}>
                    {a.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-indigo-600" />
              Module Assessment
            </h2>
            <p className="text-slate-500 mt-1">
              Test your knowledge on the concepts covered in this module.
            </p>
          </div>

          {isSubmitted && hasMultipleChoice && (
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Your Score</div>
              <div className={clsx(
                "text-3xl font-black",
                score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500"
              )}>
                {score}%
              </div>
              <div className="text-xs text-slate-400 mt-1">{mcCorrect}/{mcTotal} correct</div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className={clsx(
                "p-6 rounded-xl border transition-all",
                isSubmitted
                  ? q.type === 'multiple-choice'
                    ? answers[q.id] === q.answer
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-red-50/50 border-red-200"
                    : "bg-slate-50 border-slate-200"
                  : "bg-white border-slate-200 hover:border-indigo-200"
              )}
            >
              <div className="flex gap-4 mb-4">
                <div className={clsx(
                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                  isSubmitted
                    ? q.type === 'multiple-choice'
                      ? answers[q.id] === q.answer
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                      : "bg-slate-200 text-slate-700"
                    : "bg-indigo-100 text-indigo-700"
                )}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-slate-900">{q.question}</h3>

                  {isSubmitted && q.type === 'multiple-choice' && (
                    <div className="mt-2 flex items-center gap-2 text-sm font-medium">
                      {answers[q.id] === q.answer ? (
                        <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Correct</span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1"><XCircle className="w-4 h-4" /> Incorrect</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pl-12">
                {q.type === 'multiple-choice' && q.options ? (
                  <div className="space-y-3">
                    {q.options.map((option, optIdx) => {
                      const isSelected = answers[q.id] === option;
                      const isCorrectAnswer = isSubmitted && option === q.answer;
                      const isWrongSelection = isSubmitted && isSelected && option !== q.answer;

                      return (
                        <label
                          key={optIdx}
                          className={clsx(
                            "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                            isSubmitted ? "cursor-default" : "hover:bg-slate-50",
                            isSelected && !isSubmitted ? "border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500" : "border-slate-200",
                            isCorrectAnswer ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" : "",
                            isWrongSelection ? "border-red-500 bg-red-50 ring-1 ring-red-500" : ""
                          )}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={option}
                            checked={isSelected}
                            onChange={() => handleOptionSelect(q.id, option)}
                            disabled={isSubmitted}
                            className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                          />
                          <span className={clsx(
                            "text-slate-700",
                            isCorrectAnswer && "font-medium text-emerald-800",
                            isWrongSelection && "text-red-800 line-through opacity-70"
                          )}>
                            {option}
                          </span>

                          {isCorrectAnswer && <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />}
                          {isWrongSelection && <XCircle className="w-5 h-5 text-red-500 ml-auto" />}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={(e) => handleTextChange(q.id, e.target.value)}
                      disabled={isSubmitted}
                      placeholder="Type your answer here..."
                      className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all min-h-[120px] disabled:bg-slate-50 disabled:text-slate-600"
                      required
                    />

                    {isSubmitted && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                        <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">Reference Answer:</p>
                        <p className="text-indigo-900 text-sm">{q.answer}</p>
                        <p className="text-xs text-indigo-600 mt-3 italic">* Essay questions require manual grading by the lecturer.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
            {isSubmitted ? (
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            ) : (
              <button
                type="submit"
                disabled={Object.keys(answers).length < questions.length}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
              >
                <Send className="w-4 h-4" />
                Submit Answers
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
