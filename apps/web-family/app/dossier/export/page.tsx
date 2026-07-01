'use client';

import { useState } from 'react';
import { Button, Alert } from '@legacy/design-system';
import { useApiClient } from '../../../lib/api-client';
import { useFamilyCaseId } from '../../../lib/use-family-case';

export default function FamilleExportPage() {
  const api = useApiClient();
  const caseId = useFamilyCaseId();
  const [status, setStatus] = useState<'idle' | 'requested' | 'error'>('idle');

  async function handleExport() {
    if (!caseId) return;
    try {
      await api.post('/exports/pdf', { type: 'PDF_DEATH_CASE', targetId: caseId });
      setStatus('requested');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Export du dossier</h1>
      <p className="mt-2 text-gray-600">
        Générez un récapitulatif PDF du dossier (informations, checklist, documents) pour vos archives.
      </p>

      <div className="mt-6">
        <Button onClick={handleExport} disabled={!caseId || status === 'requested'}>
          {status === 'requested' ? 'Export en préparation…' : 'Générer un export PDF'}
        </Button>
      </div>

      {status === 'requested' && (
        <div className="mt-4">
          <Alert tone="success">
            Votre export est en cours de préparation. Vous recevrez une notification lorsqu'il sera prêt à
            télécharger.
          </Alert>
        </div>
      )}
      {status === 'error' && (
        <div className="mt-4">
          <Alert tone="danger">Une erreur est survenue, merci de réessayer.</Alert>
        </div>
      )}
    </div>
  );
}
