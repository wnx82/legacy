'use client';

import { useEffect, useState } from 'react';
import { Badge, EmptyState } from '@legacy/design-system';
import { useApiClient } from '../../lib/api-client';
import { useCurrentUser } from '../../lib/use-current-user';

interface Template {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  items: { id: string; title: string }[];
}

export default function ModelesChecklistPage() {
  const api = useApiClient();
  const { organizationId } = useCurrentUser();
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    if (!organizationId) return;
    api.get<Template[]>(`/checklist-templates?organizationId=${organizationId}`).then(setTemplates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Modèles de checklist</h1>
      <p className="mt-2 text-sm text-gray-600">
        Les modèles définissent les tâches créées automatiquement à l'ouverture d'un nouveau dossier décès.
      </p>

      <div className="mt-8 space-y-4">
        {templates.length === 0 ? (
          <EmptyState title="Aucun modèle personnalisé" description="Le modèle belge par défaut est utilisé pour l'instant." />
        ) : (
          templates.map((template) => (
            <div key={template.id} className="rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium text-midnight">{template.name}</p>
                {template.isDefault && <Badge tone="success">Par défaut</Badge>}
              </div>
              <p className="mt-1 text-sm text-gray-500">{template.description}</p>
              <p className="mt-2 text-xs text-gray-400">{template.items.length} tâches</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
