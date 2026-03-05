import React from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import type { TheoryItem } from '../data/syllabus-data';

// ─── Note box styles (full class strings — no dynamic concat for Tailwind v4) ─

const NOTE_STYLES = {
  info:    { wrapper: 'bg-blue-50 border-blue-200 text-blue-800',    icon: Info,          iconClass: 'text-blue-500'    },
  warning: { wrapper: 'bg-amber-50 border-amber-200 text-amber-800', icon: AlertTriangle, iconClass: 'text-amber-500'  },
  danger:  { wrapper: 'bg-red-50 border-red-200 text-red-800',       icon: XCircle,       iconClass: 'text-red-500'    },
  success: { wrapper: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: CheckCircle, iconClass: 'text-emerald-500' },
} as const;

function NoteBox({ text, type = 'info' }: { text: string; type?: TheoryItem['noteType'] }) {
  const style = NOTE_STYLES[type ?? 'info'];
  const Icon = style.icon;
  return (
    <div className={`flex gap-3 p-4 rounded-xl border text-sm leading-relaxed ${style.wrapper}`}>
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${style.iconClass}`} />
      <span>{text}</span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  item: TheoryItem;
}

export function RichTheoryItem({ item }: Props) {
  return (
    <div className="space-y-4">
      {/* Always-present plain text */}
      <p className="text-slate-600 leading-relaxed">{item.content}</p>

      {/* Formula box */}
      {item.formula && (
        <div className="border-l-4 border-indigo-400 bg-indigo-50 rounded-r-xl px-5 py-4">
          {item.formulaLabel && (
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">{item.formulaLabel}</p>
          )}
          <p className="font-mono text-lg font-bold text-indigo-800 tracking-wide">{item.formula}</p>
        </div>
      )}

      {/* Key points */}
      {item.keyPoints && item.keyPoints.length > 0 && (
        <ul className="space-y-2">
          {item.keyPoints.map((pt, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Worked example */}
      {item.example && (
        <div className="rounded-xl overflow-hidden border border-slate-200">
          <div className="bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 tracking-wide">
            {item.example.title}
          </div>
          <div className="divide-y divide-slate-100">
            {item.example.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-2.5 bg-white">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700 font-mono">{step}</span>
              </div>
            ))}
            {item.example.result && (
              <div className="px-4 py-2.5 bg-emerald-50 border-t-2 border-emerald-200">
                <span className="text-sm font-bold text-emerald-800 font-mono">{item.example.result}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {item.table && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          {item.table.caption && (
            <p className="text-xs font-semibold text-slate-500 px-4 pt-3 pb-1 uppercase tracking-wide">{item.table.caption}</p>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-indigo-600 text-white">
                {item.table.headers.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {item.table.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2.5 text-slate-700 border-b border-slate-100 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Code snippet */}
      {item.codeSnippet && (
        <div className="rounded-xl overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-2 text-xs text-slate-400 font-mono">python</span>
          </div>
          <pre className="bg-slate-900 text-emerald-400 text-xs font-mono px-4 py-4 overflow-x-auto leading-relaxed">{item.codeSnippet}</pre>
        </div>
      )}

      {/* Note callout */}
      {item.note && <NoteBox text={item.note} type={item.noteType} />}
    </div>
  );
}
