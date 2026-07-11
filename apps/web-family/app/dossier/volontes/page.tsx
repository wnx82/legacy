'use client';

import { useEffect, useState } from 'react';
import { Alert, EmptyState, Skeleton } from '@legacy/design-system';
import { useApiClient } from '../../../lib/api-client';
import { useFamilyCaseId } from '../../../lib/use-family-case';

interface SharedWish {
  id: string;
  category: string;
  title?: string | null;
  content: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  BURIAL_OR_CREMATION: 'Inhumation ou crémation',
  CEREMONY_TYPE: 'Type de cérémonie',
  MUSIC: 'Musiques',
  TEXTS: 'Textes',
  FLOWERS: 'Fleurs',
  CLOTHING: 'Vêtements',
  PEOPLE_TO_NOTIFY: 'Personnes à prévenir',
  MESSAGE_TO_LOVED_ONES: 'Message aux proches',
  RELIGIOUS_CHOICE: 'Choix religieux',
  ORGAN_DONATION: "Don d'organes",
  PREFERRED_FUNERAL_HOME: 'Pompes funèbres souhaitées',
  OTHER: 'Autre',
};

export default function FamilleVolontesPage() {
  const api = useApiClient();
  const caseId = useFamilyCaseId();
  const [wishes, setWishes] = useState<SharedWish[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) return;
    api
      .get<SharedWish[]>(`/death-cases/${caseId}/wishes`)
      .then(setWishes)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur de chargement'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Volontés partagées</h1>
      <p className="mt-2 text-gray-600">
        Les souhaits que votre proche avait exprimés (cérémonie, musiques, messages).
      </p>

      <div className="mt-6">
        <Alert tone="info">
          Ces informations, lorsqu'elles existent, ne remplacent pas un testament légal, un acte notarié ou un avis
          juridique.
        </Alert>
      </div>

      <div className="mt-8">
        {!caseId && (
          <EmptyState title="Aucun dossier associé" description="Utilisez votre lien d'invitation pour accéder au dossier." />
        )}
        {caseId && error && <EmptyState title="Impossible de charger les volontés" description={error} />}
        {caseId && !error && wishes === null && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}
        {caseId && !error && wishes !== null && wishes.length === 0 && (
          <EmptyState title="Aucune volonté partagée pour le moment" />
        )}
        {wishes !== null && wishes.length > 0 && (
          <ul className="space-y-4">
            {wishes.map((w) => (
              <li key={w.id} className="rounded-md border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-sage">
                  {CATEGORY_LABELS[w.category] ?? w.category}
                </p>
                {w.title && <p className="mt-1 font-medium text-midnight">{w.title}</p>}
                <p className="mt-1 whitespace-pre-line text-gray-700">{w.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
