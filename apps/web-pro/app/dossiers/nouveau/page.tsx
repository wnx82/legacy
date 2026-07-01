'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Alert } from '@legacy/design-system';
import { useApiClient } from '../../../lib/api-client';
import { useCurrentUser } from '../../../lib/use-current-user';

export default function NouveauDossierPage() {
  const api = useApiClient();
  const router = useRouter();
  const { organizationId } = useCurrentUser();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const deathCase = await api.post<{ id: string }>('/death-cases', {
        deceasedFirstName: form.get('deceasedFirstName'),
        deceasedLastName: form.get('deceasedLastName'),
        dateOfDeath: form.get('dateOfDeath'),
        placeOfDeath: form.get('placeOfDeath') || undefined,
        municipality: form.get('municipality') || undefined,
        organizationId,
      });
      router.push(`/dossiers/${deathCase.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-midnight">Nouveau dossier décès</h1>
      <p className="mt-2 text-sm text-gray-600">
        Ces informations pourront être complétées à tout moment depuis le dossier.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="deceasedFirstName" required placeholder="Prénom du défunt" className="rounded-md border border-gray-300 p-3" />
          <input name="deceasedLastName" required placeholder="Nom du défunt" className="rounded-md border border-gray-300 p-3" />
        </div>
        <label className="block text-sm text-gray-600">
          Date de décès
          <input name="dateOfDeath" type="date" required className="mt-1 w-full rounded-md border border-gray-300 p-3" />
        </label>
        <input name="placeOfDeath" placeholder="Lieu de décès (optionnel)" className="w-full rounded-md border border-gray-300 p-3" />
        <input name="municipality" placeholder="Commune (optionnel)" className="w-full rounded-md border border-gray-300 p-3" />

        {error && (
          <Alert tone="danger" title="Impossible de créer le dossier">
            {error}
          </Alert>
        )}

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Création…' : 'Créer le dossier'}
        </Button>
      </form>
    </div>
  );
}
