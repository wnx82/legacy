'use client';

import { useEffect, useState } from 'react';
import { FileUpload, EmptyState, Alert } from '@legacy/design-system';
import { useApiClient } from '../../../lib/api-client';
import { useFamilyCaseId } from '../../../lib/use-family-case';

const CATEGORIES = [
  { key: 'identity', label: 'Identité' },
  { key: 'health', label: 'Santé' },
  { key: 'insurance', label: 'Assurance' },
  { key: 'bank', label: 'Banque' },
  { key: 'housing', label: 'Logement' },
  { key: 'succession', label: 'Succession' },
  { key: 'other', label: 'Autres' },
];

interface DocumentItem {
  id: string;
  filename: string;
  category: { label: string };
}

export default function FamilleDocumentsPage() {
  const api = useApiClient();
  const caseId = useFamilyCaseId();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [category, setCategory] = useState('identity');
  const [message, setMessage] = useState<string | null>(null);

  function refresh() {
    if (!caseId) return;
    api.get<DocumentItem[]>(`/death-cases/${caseId}/documents`).then(setDocuments);
  }

  useEffect(refresh, [caseId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFiles(files: FileList) {
    if (!caseId) return;
    const file = files[0];
    const { uploadUrl, document } = await api.post<{ uploadUrl: string; document: { id: string } }>(
      `/death-cases/${caseId}/documents`,
      {
        filename: file.name,
        mimeType: file.type || 'application/pdf',
        sizeBytes: file.size,
        categoryKey: category,
      },
    );
    await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    // Confirme la fin de l'upload : déclenche checksum + scan antivirus.
    await api.post(`/documents/${document.id}/confirm`);
    setMessage(`« ${file.name} » a bien été envoyé.`);
    refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Documents</h1>
      <p className="mt-2 text-gray-600">Envoyez les documents demandés — ils sont chiffrés et accessibles uniquement aux personnes autorisées.</p>

      <div className="mt-6 flex items-center gap-3">
        <label className="text-sm text-gray-600">Catégorie :</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border border-gray-300 p-2">
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <FileUpload label="Déposer un document" hint="PDF, image — 20 Mo maximum" onFilesSelected={handleFiles} />
      </div>

      {message && (
        <div className="mt-4">
          <Alert tone="success">{message}</Alert>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-medium text-midnight">Documents déjà envoyés</h2>
        <div className="mt-3">
          {documents.length === 0 ? (
            <EmptyState title="Aucun document envoyé pour le moment" />
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li key={doc.id} className="flex justify-between rounded-md border border-gray-200 p-3 text-sm">
                  <span className="font-medium text-midnight">{doc.filename}</span>
                  <span className="text-gray-500">{doc.category.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
