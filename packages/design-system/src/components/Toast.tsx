import * as React from 'react';
import clsx from 'clsx';
import type { StatusTone } from '../tokens';

export interface ToastProps {
  tone?: Extract<StatusTone, 'info' | 'success' | 'warning' | 'danger'>;
  title: string;
  description?: string;
  onClose?: () => void;
}

const TONE_CLASSES: Record<string, string> = {
  info: 'border-midnight/20',
  success: 'border-sage/30',
  warning: 'border-warning/30',
  danger: 'border-alert/30',
};

/** Composant présentationnel — la gestion de la pile de toasts est laissée à l'app consommatrice. */
export function Toast({ tone = 'info', title, description, onClose }: ToastProps) {
  return (
    <div className={clsx('flex items-start gap-3 rounded-md border bg-white p-4 shadow-md', TONE_CLASSES[tone])}>
      <div className="flex-1">
        <p className="text-sm font-medium text-midnight">{title}</p>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Fermer" className="text-gray-400 hover:text-gray-600">
          ×
        </button>
      )}
    </div>
  );
}
