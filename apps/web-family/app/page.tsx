'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardTitle, CardDescription, Alert, Button, EmptyState } from '@legacy/design-system';
import { useApiClient } from '../lib/api-client';
import { useFamilyCaseId } from '../lib/use-family-case';

interface DeathCase {
  id: string;
  deceasedFirstName: string;
  deceasedLastName: string;
  status: string;
}

interface Task {
  id: string;
  status: string;
}

export default function AccueilFamillePage() {
  const api = useApiClient();
  const caseId = useFamilyCaseId();
  const [deathCase, setDeathCase] = useState<DeathCase | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!caseId) return;
    api.get<DeathCase>(`/death-cases/${caseId}`).then(setDeathCase);
    api.get<Task[]>(`/death-cases/${caseId}/tasks`).then(setTasks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  if (!caseId) {
    return (
      <EmptyState
        title="Aucun dossier associé à votre compte pour le moment"
        description="Utilisez le lien d'invitation envoyé par la pompe funèbre ou votre proche pour accéder à un dossier."
      />
    );
  }

  const remaining = tasks.filter((t) => t.status !== 'DONE' && t.status !== 'NOT_APPLICABLE').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-midnight">
          {deathCase ? `Dossier de ${deathCase.deceasedFirstName} ${deathCase.deceasedLastName}` : 'Chargement…'}
        </h1>
        <p className="mt-2 text-gray-600">
          Voici un aperçu de ce qu'il reste à faire. Prenez votre temps — chaque étape est expliquée simplement.
        </p>
      </div>

      <Alert tone="info" title="Vous n'êtes pas seul·e">
        La pompe funèbre qui accompagne ce dossier peut répondre à vos questions à tout moment via la messagerie.
      </Alert>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardTitle>Démarches restantes</CardTitle>
          <CardDescription>{remaining} tâche(s) à compléter sur {tasks.length}.</CardDescription>
          <Link href="/dossier/checklist" className="mt-4 inline-block">
            <Button variant="secondary">Voir la checklist</Button>
          </Link>
        </Card>
        <Card>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Envoyez les documents demandés par la pompe funèbre.</CardDescription>
          <Link href="/dossier/documents" className="mt-4 inline-block">
            <Button variant="secondary">Gérer mes documents</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
