import React from 'react';
import { CheckCircle2, XCircle, Circle, Target } from 'lucide-react';

interface ObjectiveResult {
  id: number;
  description: string;
  passed: boolean;
  output?: string;
}

interface LabObjectivesProps {
  objectives: Array<{ id: number; description: string }>;
  results?: ObjectiveResult[];
  score?: number;
  checking?: boolean;
  onCheck: () => void;
}

export const LabObjectives: React.FC<LabObjectivesProps> = ({
  objectives,
  results,
  score,
  checking,
  onCheck,
}) => {
  const getIcon = (objId: number) => {
    if (!results) return <Circle className="w-5 h-5 text-slate-300" />;
    const result = results.find(r => r.id === objId);
    if (!result) return <Circle className="w-5 h-5 text-slate-300" />;
    return result.passed
      ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      : <XCircle className="w-5 h-5 text-red-400" />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
          <Target className="w-4 h-4 text-indigo-500" />
          Objectives
        </h3>
        {results && score !== undefined && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            score >= 80 ? 'bg-emerald-100 text-emerald-700' :
            score >= 50 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {score}%
          </span>
        )}
      </div>

      <div className="space-y-2">
        {objectives.map((obj) => (
          <div key={obj.id} className="flex items-start gap-2.5 py-1.5">
            {getIcon(obj.id)}
            <span className="text-sm text-slate-700 leading-snug">{obj.description}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onCheck}
        disabled={checking}
        className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {checking ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Checking...
          </>
        ) : (
          <>
            <Target className="w-4 h-4" />
            Check Objectives
          </>
        )}
      </button>
    </div>
  );
};
