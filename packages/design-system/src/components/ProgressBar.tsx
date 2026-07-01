import * as React from 'react';
import clsx from 'clsx';

export interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  className?: string;
}

/** Barre de progression du dossier vivant — jamais présentée comme une contrainte, mais comme une aide. */
export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={className}>
      {label && (
        <div className="mb-1 flex justify-between text-sm text-gray-500">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
      >
        <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
