'use client';

import { useEffect, useState } from 'react';
import { Button, Alert } from '@legacy/design-system';
import { useApiClient } from '../../lib/api-client';
import { useCurrentUser } from '../../lib/use-current-user';

const TEMPLATE_KEYS = [
  { key: 'familyWelcome', label: 'Message de bienvenue à une famille' },
  { key: 'documentRequest', label: 'Demande de document' },
];

export default function ModelesMessagesPage() {
  const api = useApiClient();
  const { organizationId } = useCurrentUser();
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!organizationId) return;
    api
      .get<{ messageTemplates?: Record<string, string> }>(`/organizations/${organizationId}/settings`)
      .then((s) => setTemplates(s?.messageTemplates ?? {}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organizationId) return;
    await api.patch(`/organizations/${organizationId}/settings`, { messageTemplates: templates });
    setSaved(true);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-midnight">Modèles de messages</h1>
      <p className="mt-2 text-sm text-gray-600">Gagnez du temps avec des messages types réutilisables.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {TEMPLATE_KEYS.map(({ key, label }) => (
          <label key={key} className="block text-sm text-gray-600">
            {label}
            <textarea
              rows={3}
              value={templates[key] ?? ''}
              onChange={(e) => setTemplates({ ...templates, [key]: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 p-3"
            />
          </label>
        ))}
        {saved && <Alert tone="success">Modèles enregistrés.</Alert>}
        <Button type="submit">Enregistrer</Button>
      </form>
    </div>
  );
}
