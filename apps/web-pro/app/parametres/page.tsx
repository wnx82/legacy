'use client';

import { useEffect, useState } from 'react';
import { Button, Alert } from '@legacy/design-system';
import { useApiClient } from '../../lib/api-client';
import { useCurrentUser } from '../../lib/use-current-user';

interface Settings {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function ParametresPage() {
  const api = useApiClient();
  const { organizationId } = useCurrentUser();
  const [settings, setSettings] = useState<Settings>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!organizationId) return;
    api.get<Settings>(`/organizations/${organizationId}/settings`).then((s) => setSettings(s ?? {}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organizationId) return;
    await api.patch(`/organizations/${organizationId}/settings`, settings);
    setSaved(true);
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-midnight">Paramètres de l'organisation</h1>
      <p className="mt-2 text-sm text-gray-600">Personnalisez l'espace vu par vos familles et vos collaborateurs.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block text-sm text-gray-600">
          URL du logo
          <input
            value={settings.logoUrl ?? ''}
            onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-300 p-3"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm text-gray-600">
            Couleur principale
            <input
              type="color"
              value={settings.primaryColor ?? '#0B1E3D'}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
              className="mt-1 h-11 w-full rounded-md border border-gray-300"
            />
          </label>
          <label className="block text-sm text-gray-600">
            Couleur secondaire
            <input
              type="color"
              value={settings.secondaryColor ?? '#7C9885'}
              onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
              className="mt-1 h-11 w-full rounded-md border border-gray-300"
            />
          </label>
        </div>
        {saved && <Alert tone="success">Paramètres enregistrés.</Alert>}
        <Button type="submit">Enregistrer</Button>
      </form>
    </div>
  );
}
