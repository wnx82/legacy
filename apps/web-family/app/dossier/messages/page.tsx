'use client';

import { useEffect, useState } from 'react';
import { EmptyState } from '@legacy/design-system';
import { useApiClient } from '../../../lib/api-client';
import { useFamilyCaseId } from '../../../lib/use-family-case';

interface NoteItem {
  id: string;
  content: string;
  createdAt: string;
}

export default function FamilleMessagesPage() {
  const api = useApiClient();
  const caseId = useFamilyCaseId();
  const [notes, setNotes] = useState<NoteItem[]>([]);

  useEffect(() => {
    if (!caseId) return;
    api.get<NoteItem[]>(`/death-cases/${caseId}/notes`).then(setNotes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Messages de la pompe funèbre</h1>
      <p className="mt-2 text-gray-600">Les informations partagées avec vous par le professionnel qui accompagne ce dossier.</p>

      <div className="mt-8 space-y-3">
        {notes.length === 0 ? (
          <EmptyState title="Aucun message pour le moment" />
        ) : (
          notes.map((note) => (
            <div key={note.id} className="rounded-md border border-gray-200 bg-beige p-4">
              <p className="text-sm text-gray-700">{note.content}</p>
              <p className="mt-2 text-xs text-gray-400">{new Date(note.createdAt).toLocaleString('fr-BE')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
