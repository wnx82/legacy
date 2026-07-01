'use client';

import { useEffect, useState } from 'react';
import { Card } from '@legacy/design-system';
import { useApiClient } from '../../lib/api-client';
import { useCurrentUser } from '../../lib/use-current-user';

interface OrganizationStats {
  deathCasesByStatus: Record<string, number>;
  activeCases: number;
  totalDocuments: number;
  overdueTasks: number;
  totalMembers: number;
  totalFamilyInvites: number;
}

/**
 * Statistiques d'usage du portail (différentes des statistiques d'audience
 * du site public, mesurées séparément par Umami — voir docs/rgpd.md).
 */
export default function StatistiquesPage() {
  const api = useApiClient();
  const { organizationId } = useCurrentUser();
  const [stats, setStats] = useState<OrganizationStats | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    api.get<OrganizationStats>(`/organizations/${organizationId}/stats`).then(setStats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Statistiques</h1>
      <p className="mt-2 text-sm text-gray-600">Un aperçu de l'activité de votre organisation sur Legacy.</p>

      {stats && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <p className="text-sm text-gray-500">Dossiers actifs</p>
            <p className="mt-2 text-3xl font-semibold text-midnight">{stats.activeCases}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Documents reçus</p>
            <p className="mt-2 text-3xl font-semibold text-midnight">{stats.totalDocuments}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Tâches en retard</p>
            <p className="mt-2 text-3xl font-semibold text-warning">{stats.overdueTasks}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Collaborateurs actifs</p>
            <p className="mt-2 text-3xl font-semibold text-midnight">{stats.totalMembers}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Proches invités (total)</p>
            <p className="mt-2 text-3xl font-semibold text-midnight">{stats.totalFamilyInvites}</p>
          </Card>
        </div>
      )}
    </div>
  );
}
