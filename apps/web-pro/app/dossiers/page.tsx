'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, EmptyState } from '@legacy/design-system';
import { useApiClient } from '../../lib/api-client';
import { useCurrentUser } from '../../lib/use-current-user';

interface DeathCase {
  id: string;
  deceasedFirstName: string;
  deceasedLastName: string;
  dateOfDeath: string;
  status: string;
}

const STATUS_TONE: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
  NEW: 'info',
  IN_PROGRESS: 'info',
  MISSING_DOCUMENTS: 'warning',
  CEREMONY_PLANNED: 'success',
  COMPLETED: 'success',
  ARCHIVED: 'neutral',
};

export default function DossiersPage() {
  const api = useApiClient();
  const { organizationId } = useCurrentUser();
  const [cases, setCases] = useState<DeathCase[] | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!organizationId) return;
    api.get<DeathCase[]>(`/death-cases?organizationId=${organizationId}`).then(setCases);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const filtered = cases?.filter((c) =>
    `${c.deceasedFirstName} ${c.deceasedLastName}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-midnight">Dossiers décès</h1>
        <Link href="/dossiers/nouveau">
          <Button>Nouveau dossier</Button>
        </Link>
      </div>

      <input
        placeholder="Rechercher un dossier…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-6 w-full max-w-sm rounded-md border border-gray-300 p-2.5"
      />

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
        {!filtered || filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Aucun dossier pour le moment"
              description="Créez votre premier dossier décès pour commencer à accompagner une famille."
              action={
                <Link href="/dossiers/nouveau">
                  <Button>Créer un dossier</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-4">Défunt·e</th>
                <th className="p-4">Date de décès</th>
                <th className="p-4">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <Link href={`/dossiers/${c.id}`} className="font-medium text-midnight hover:underline">
                      {c.deceasedFirstName} {c.deceasedLastName}
                    </Link>
                  </td>
                  <td className="p-4 text-gray-600">{new Date(c.dateOfDeath).toLocaleDateString('fr-BE')}</td>
                  <td className="p-4">
                    <Badge tone={STATUS_TONE[c.status] ?? 'neutral'}>{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
