import * as React from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

/** État vide toujours rassurant et actionnable — jamais un simple "Aucune donnée". */
export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-10 text-center">
      {icon && <div className="mb-4 text-sage">{icon}</div>}
      <p className="text-base font-medium text-midnight">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
