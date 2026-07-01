import * as React from 'react';
import clsx from 'clsx';
import { statusColors, type StatusTone } from '../tokens';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
}

/** Badge de statut — utilisé pour DeathCaseStatus, ChecklistTaskStatus, priorités. */
export function Badge({ tone = 'neutral', className, style, ...props }: BadgeProps) {
  const { bg, text } = statusColors[tone];
  return (
    <span
      className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', className)}
      style={{ backgroundColor: bg, color: text, ...style }}
      {...props}
    />
  );
}
