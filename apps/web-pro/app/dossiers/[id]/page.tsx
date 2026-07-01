'use client';

import { useEffect, useState } from 'react';
import { Badge, Card } from '@legacy/design-system';
import { useApiClient } from '../../../lib/api-client';
import { DossierTabs } from '../../../components/DossierTabs';

interface DeathCaseDetail {
  id: string;
  deceasedFirstName: string;
  deceasedLastName: string;
  dateOfDeath: string;
  placeOfDeath?: string;
  municipality?: string;
  status: string;
}

export default function DossierDetailPage({ params }: { params: { id: string } }) {
  const api = useApiClient();
  const [deathCase, setDeathCase] = useState<DeathCaseDetail | null>(null);

  useEffect(() => {
    api.get<DeathCaseDetail>(`/death-cases/${params.id}`).then(setDeathCase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-midnight">
          {deathCase ? `${deathCase.deceasedFirstName} ${deathCase.deceasedLastName}` : 'Chargement…'}
        </h1>
        {deathCase && <Badge tone="info">{deathCase.status}</Badge>}
      </div>

      <div className="mt-6">
        <DossierTabs id={params.id} />
      </div>

      {deathCase && (
        <Card className="mt-6 max-w-lg">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Date de décès</dt>
              <dd className="font-medium text-midnight">{new Date(deathCase.dateOfDeath).toLocaleDateString('fr-BE')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Lieu de décès</dt>
              <dd className="font-medium text-midnight">{deathCase.placeOfDeath ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Commune</dt>
              <dd className="font-medium text-midnight">{deathCase.municipality ?? '—'}</dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}
