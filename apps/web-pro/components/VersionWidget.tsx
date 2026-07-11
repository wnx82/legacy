'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card } from '@legacy/design-system';
import { useApiClient } from '../lib/api-client';

interface VersionCheckResult {
  checked: boolean;
  current: string;
  latest: string | null;
  updateAvailable: boolean;
}

interface PublicVersion {
  current: string;
  service: string;
}

interface VersionWidgetProps {
  /** `compact` : pastille discrète pour la navbar. `full` : carte de tableau de bord. */
  variant?: 'compact' | 'full';
}

/**
 * Affiche la version du conteneur et, pour un SUPER_ADMIN, la dernière version
 * publiée sur GitHub. La vérification distante (`/version-check`) est réservée
 * aux administrateurs : pour les autres rôles, on retombe proprement sur la
 * version publique (`/version`) sans afficher d'état de mise à jour.
 */
export function VersionWidget({ variant = 'full' }: VersionWidgetProps) {
  const api = useApiClient();
  const [data, setData] = useState<VersionCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [restricted, setRestricted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get<VersionCheckResult>('/version-check');
      setData(result);
      setRestricted(false);
    } catch {
      // 403 (rôle insuffisant) ou erreur : on affiche au moins la version publique.
      try {
        const pub = await api.get<PublicVersion>('/version');
        setData({ checked: false, current: pub.current, latest: null, updateAvailable: false });
        setRestricted(true);
      } catch {
        setData(null);
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const current = data?.current ?? '—';
  const badge = data?.updateAvailable ? (
    <Badge tone="warning">Mise à jour disponible</Badge>
  ) : (
    <Badge tone="success">À jour</Badge>
  );

  if (variant === 'compact') {
    return (
      <span className="inline-flex items-center gap-2 text-xs text-gray-500">
        <span className="font-mono">v{current}</span>
        {!restricted && data?.checked && data.updateAvailable && <Badge tone="warning">MAJ</Badge>}
      </span>
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">Version de la plateforme</p>
          <p className="mt-1 text-2xl font-semibold text-midnight">
            {loading ? '…' : <span className="font-mono">v{current}</span>}
          </p>
        </div>
        {!loading && !restricted && data?.checked && badge}
      </div>

      {!restricted && data?.checked && (
        <p className="mt-3 text-sm text-gray-500">
          {data.updateAvailable ? (
            <>
              Dernière version publiée : <span className="font-mono text-midnight">v{data.latest}</span>
            </>
          ) : (
            'Vous utilisez la dernière version publiée.'
          )}
        </p>
      )}
      {restricted && (
        <p className="mt-3 text-sm text-gray-400">
          Vérification des mises à jour réservée aux super-administrateurs.
        </p>
      )}

      <div className="mt-4">
        <Button variant="ghost" onClick={() => void load()} disabled={loading} className="text-sm">
          {loading ? 'Vérification…' : 'Rafraîchir'}
        </Button>
      </div>
    </Card>
  );
}
