'use client';

import { useEffect, useState } from 'react';
import { EmptyState } from '@legacy/design-system';
import { useApiClient } from '../../../../lib/api-client';
import { DossierTabs } from '../../../../components/DossierTabs';

interface DocumentItem {
  id: string;
  filename: string;
  category: { label: string };
  createdAt: string;
}

export default function DossierDocumentsPage({ params }: { params: { id: string } }) {
  const api = useApiClient();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    api.get<DocumentItem[]>(`/death-cases/${params.id}/documents`).then(setDocuments);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Dossier décès</h1>
      <div className="mt-6">
        <DossierTabs id={params.id} />
      </div>
      <div className="mt-6">
        {documents.length === 0 ? (
          <EmptyState
            title="Aucun document pour le moment"
            description="Demandez à la famille d'envoyer les documents nécessaires depuis son espace."
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="p-3">Fichier</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Ajouté le</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-t border-gray-100">
                  <td className="p-3 font-medium text-midnight">{doc.filename}</td>
                  <td className="p-3 text-gray-600">{doc.category.label}</td>
                  <td className="p-3 text-gray-500">{new Date(doc.createdAt).toLocaleDateString('fr-BE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
