import * as React from 'react';

export interface FileUploadProps {
  label: string;
  hint?: string;
  onFilesSelected: (files: FileList) => void;
  accept?: string;
}

/** Zone de dépôt sobre — le traitement réel (upload signé) est géré par l'app consommatrice. */
export function FileUpload({ label, hint, onFilesSelected, accept }: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-sage/60"
      onClick={() => inputRef.current?.click()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) onFilesSelected(e.dataTransfer.files);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <p className="font-medium text-midnight">{label}</p>
      {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
      />
    </div>
  );
}
