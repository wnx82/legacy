import * as React from 'react';

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Toujours utilisée pour confirmer une suppression ou une action sensible avant exécution. */
export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-midnight">{title}</h2>
          <button onClick={onClose} aria-label="Fermer" className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
