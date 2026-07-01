'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardTitle, CardDescription, Button, Skeleton } from '@legacy/design-system';
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

export default function DashboardPage() {
  const api = useApiClient();
  const { organizationId, loading: userLoading } = useCurrentUser();
  const [stats, setStats] = useState<OrganizationStats | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    api.get<OrganizationStats>(`/organizations/${organizationId}/stats`).then(setStats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-midnight">Tableau de bord</h1>
        <Link href="/dossiers/nouveau">
          <Button>Nouveau dossier décès</Button>
        </Link>
      </div>

      {userLoading || !stats ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Dossiers actifs" value={stats.activeCases} />
          <StatCard label="Tâches en retard" value={stats.overdueTasks} tone="warning" />
          <StatCard label="Documents reçus" value={stats.totalDocuments} />
          <StatCard label="Familles invitées" value={stats.totalFamilyInvites} />
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Dossiers par statut</CardTitle>
          <CardDescription>Vue d'ensemble de l'activité en cours.</CardDescription>
          <ul className="mt-4 space-y-2 text-sm">
            {stats &&
              Object.entries(stats.deathCasesByStatus).map(([status, count]) => (
                <li key={status} className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">{status}</span>
                  <span className="font-medium text-midnight">{count}</span>
                </li>
              ))}
          </ul>
        </Card>
        <Card>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Les tâches les plus fréquentes du portail.</CardDescription>
          <div className="mt-4 flex flex-col gap-3">
            <Link href="/dossiers">
              <Button variant="ghost" className="w-full justify-start">
                Voir tous les dossiers
              </Button>
            </Link>
            <Link href="/collaborateurs">
              <Button variant="ghost" className="w-full justify-start">
                Gérer les collaborateurs
              </Button>
            </Link>
            <Link href="/parametres">
              <Button variant="ghost" className="w-full justify-start">
                Personnaliser mon espace
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: 'warning' }) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tone === 'warning' ? 'text-warning' : 'text-midnight'}`}>{value}</p>
    </Card>
  );
}
