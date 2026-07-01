import * as React from 'react';
import clsx from 'clsx';
import { Badge } from './Badge';
import type { StatusTone } from '../tokens';

export interface ChecklistItemProps {
  title: string;
  description?: string;
  statusLabel: string;
  statusTone?: StatusTone;
  priorityLabel?: string;
  priorityTone?: StatusTone;
  onClick?: () => void;
}

export function ChecklistItem({
  title,
  description,
  statusLabel,
  statusTone = 'neutral',
  priorityLabel,
  priorityTone = 'neutral',
  onClick,
}: ChecklistItemProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      className={clsx(
        'flex items-start justify-between gap-4 rounded-md border border-gray-200 bg-white p-4',
        onClick && 'cursor-pointer hover:border-sage/50',
      )}
    >
      <div>
        <p className="font-medium text-midnight">{title}</p>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <Badge tone={statusTone}>{statusLabel}</Badge>
        {priorityLabel && <Badge tone={priorityTone}>{priorityLabel}</Badge>}
      </div>
    </div>
  );
}
