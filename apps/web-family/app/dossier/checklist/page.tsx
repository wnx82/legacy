'use client';

import { useEffect, useState } from 'react';
import { ChecklistItem, EmptyState } from '@legacy/design-system';
import { useApiClient } from '../../../lib/api-client';
import { useFamilyCaseId } from '../../../lib/use-family-case';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  visibleToFamily: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  BLOCKED: 'Bloqué',
  WAITING_DOCUMENT: 'En attente de document',
  DONE: 'Terminé',
  NOT_APPLICABLE: 'Non applicable',
};

export default function FamilleChecklistPage() {
  const api = useApiClient();
  const caseId = useFamilyCaseId();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!caseId) return;
    api.get<Task[]>(`/death-cases/${caseId}/tasks`).then((all) => setTasks(all.filter((t) => t.visibleToFamily)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Les démarches à suivre</h1>
      <p className="mt-2 text-gray-600">Chaque étape est suivie par la pompe funèbre qui vous accompagne.</p>

      <div className="mt-8 space-y-3">
        {tasks.length === 0 ? (
          <EmptyState title="Aucune démarche pour le moment" />
        ) : (
          tasks.map((task) => (
            <ChecklistItem
              key={task.id}
              title={task.title}
              description={task.description}
              statusLabel={STATUS_LABELS[task.status] ?? task.status}
              statusTone={task.status === 'DONE' ? 'success' : task.status === 'BLOCKED' ? 'danger' : 'info'}
            />
          ))
        )}
      </div>
    </div>
  );
}
