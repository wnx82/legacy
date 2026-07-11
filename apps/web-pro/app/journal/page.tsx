'use client';

import { useEffect, useState } from 'react';
import { Card, Badge, EmptyState, Skeleton } from '@legacy/design-system';
import { useApiClient } from '../../lib/api-client';
import { useCurrentUser } from '../../lib/use-current-user';

interface AuditSummary {
  total: number;
  last7Days: number;
  failures: number;
  byAction: { action: string; count: number }[];
  byResult: { result: string; count: number }[];
}

interface AuditLog {
  id: string;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  result: string;
  userId?: string | null;
  createdAt: string;
}

interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export default function JournalPage() {
  const api = useApiClient();
  const { organizationId, loading } = useCurrentUser();
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [logs, setLogs] = useState<AuditLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    const q = `?organizationId=${organizationId}`;
    Promise.all([
      api.get<AuditSummary>(`/audit-logs/summary${q}`),
      api.get<Paginated<AuditLog>>(`/audit-logs${q}&pageSize=50`),
    ])
      .then(([s, l]) => {
        setSummary(s);
        setLogs(l.items);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur de chargement'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Journal d'audit</h1>
      <p className="mt-2 text-sm text-gray-600">
        Traçabilité des actions sensibles réalisées au sein de votre organisation.
      </p>

      {error && (
        <div className="mt-6">
          <EmptyState title="Accès au journal impossible" description={error} />
        </div>
      )}

      {!error && !loading && summary === null && (
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {summary && (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <Card>
              <p className="text-sm text-gray-500">Événements (total)</p>
              <p className="mt-2 text-3xl font-semibold text-midnight">{summary.total}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">7 derniers jours</p>
              <p className="mt-2 text-3xl font-semibold text-midnight">{summary.last7Days}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">Échecs</p>
              <p className="mt-2 text-3xl font-semibold text-warning">{summary.failures}</p>
            </Card>
          </div>

          {summary.byAction.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-midnight">Actions les plus fréquentes</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {summary.byAction.map((a) => (
                  <Badge key={a.action} tone="neutral">
                    {a.action} · {a.count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-medium text-midnight">Événements récents</h2>
        {logs !== null && logs.length === 0 && (
          <div className="mt-3">
            <EmptyState title="Aucun événement pour le moment" />
          </div>
        )}
        {logs !== null && logs.length > 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Action</th>
                  <th className="py-2 pr-4">Ressource</th>
                  <th className="py-2 pr-4">Résultat</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-gray-100">
                    <td className="py-2 pr-4 text-gray-600">
                      {new Date(log.createdAt).toLocaleString('fr-BE')}
                    </td>
                    <td className="py-2 pr-4 font-medium text-midnight">{log.action}</td>
                    <td className="py-2 pr-4 text-gray-600">{log.resourceType ?? '—'}</td>
                    <td className="py-2 pr-4">
                      <Badge tone={log.result === 'SUCCESS' ? 'success' : 'danger'}>{log.result}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
