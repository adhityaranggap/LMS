import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
}

export function SkeletonRow({ className }: SkeletonProps) {
  return (
    <div className={clsx('animate-pulse flex gap-4 py-3', className)}>
      <div className="h-4 bg-slate-200 rounded w-1/4" />
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="h-4 bg-slate-200 rounded w-1/6" />
      <div className="h-4 bg-slate-200 rounded w-1/6" />
    </div>
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={clsx('animate-pulse bg-white rounded-xl p-5 shadow-sm border border-slate-100', className)}>
      <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
      <div className="h-8 bg-slate-200 rounded w-1/3 mb-2" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
    </div>
  );
}

export function SkeletonText({ lines = 3, className }: SkeletonProps & { lines?: number }) {
  return (
    <div className={clsx('animate-pulse space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 rounded"
          style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
