'use client';

import { useEffect, useState } from 'react';
import { ChecklistItem } from '@legacy/design-system';
import { useApiClient } from '../../../../lib/api-client';
import { DossierTabs } from '../../../../components/DossierTabs';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
}

const STATUS_LABELS: Record<string, string> = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  BLOCKED: 'Bloqué',
  WAITING_DOCUMENT: 'En attente de document',
  DONE: 'Terminé',
  NOT_APPLICABLE: 'Non applicable',
};

const PRIORITY_LABELS: Record<string, string> = { LOW: 'Basse', NORMAL: 'Normale', HIGH: 'Haute', URGENT: 'Urgente' };

export default function DossierChecklistPage({ params }: { params: { id: string } }) {
  const api = useApiClient();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    api.get<Task[]>(`/death-cases/${params.id}/tasks`).then(setTasks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function cycleStatus(task: Task) {
    const order = ['TODO', 'IN_PROGRESS', 'WAITING_DOCUMENT', 'BLOCKED', 'DONE', 'NOT_APPLICABLE'];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    const updated = await api.patch<Task>(`/death-cases/${params.id}/tasks/${task.id}`, { status: next });
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Dossier décès</h1>
      <div className="mt-6">
        <DossierTabs id={params.id} />
      </div>
      <p className="mt-6 text-sm text-gray-500">Cliquez sur une tâche pour faire avancer son statut.</p>
      <div className="mt-4 space-y-3">
        {tasks.map((task) => (
          <ChecklistItem
            key={task.id}
            title={task.title}
            description={task.description}
            statusLabel={STATUS_LABELS[task.status] ?? task.status}
            statusTone={task.status === 'DONE' ? 'success' : task.status === 'BLOCKED' ? 'danger' : 'info'}
            priorityLabel={PRIORITY_LABELS[task.priority]}
            priorityTone={task.priority === 'URGENT' || task.priority === 'HIGH' ? 'warning' : 'neutral'}
            onClick={() => cycleStatus(task)}
          />
        ))}
      </div>
    </div>
  );
}
