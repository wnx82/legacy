'use client';

import { useEffect, useState } from 'react';
import { Button, EmptyState } from '@legacy/design-system';
import { useApiClient } from '../../../../lib/api-client';
import { DossierTabs } from '../../../../components/DossierTabs';

interface NoteItem {
  id: string;
  content: string;
  visibility: string;
  createdAt: string;
}

export default function DossierNotesPage({ params }: { params: { id: string } }) {
  const api = useApiClient();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [content, setContent] = useState('');

  function refresh() {
    api.get<NoteItem[]>(`/death-cases/${params.id}/notes`).then(setNotes);
  }

  useEffect(refresh, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    await api.post(`/death-cases/${params.id}/notes`, { content, visibility: 'INTERNAL_PRO' });
    setContent('');
    refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Dossier décès</h1>
      <div className="mt-6">
        <DossierTabs id={params.id} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Ajouter une note interne (non visible par la famille)…"
          className="w-full rounded-md border border-gray-300 p-3"
        />
        <Button type="submit">Ajouter la note</Button>
      </form>

      <div className="mt-6 space-y-3">
        {notes.length === 0 ? (
          <EmptyState title="Aucune note pour ce dossier" />
        ) : (
          notes.map((note) => (
            <div key={note.id} className="rounded-md border border-gray-200 p-4">
              <p className="text-sm text-gray-700">{note.content}</p>
              <p className="mt-2 text-xs text-gray-400">{new Date(note.createdAt).toLocaleString('fr-BE')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
