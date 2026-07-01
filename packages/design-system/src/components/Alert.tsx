import * as React from 'react';
import clsx from 'clsx';
import type { StatusTone } from '../tokens';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: Extract<StatusTone, 'info' | 'success' | 'warning' | 'danger'>;
  title?: string;
}

const TONE_CLASSES: Record<string, string> = {
  info: 'bg-[#E4EDF7] text-midnight border-midnight/10',
  success: 'bg-sage-light text-sage border-sage/20',
  warning: 'bg-warning-light text-warning border-warning/20',
  danger: 'bg-alert-light text-alert border-alert/20',
};

/**
 * Toujours utilisé pour expliquer une action sensible avant qu'elle ne soit
 * effectuée (ex: activation d'un accès après décès) — jamais de vocabulaire
 * brutal, voir docs/product.md.
 */
export function Alert({ tone = 'info', title, className, children, ...props }: AlertProps) {
  return (
    <div role="alert" className={clsx('rounded-md border p-4', TONE_CLASSES[tone], className)} {...props}>
      {title && <p className="font-semibold">{title}</p>}
      <div className="text-sm mt-1">{children}</div>
    </div>
  );
}
