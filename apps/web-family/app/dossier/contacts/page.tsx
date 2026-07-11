'use client';

import { useEffect, useState } from 'react';
import { EmptyState, Skeleton } from '@legacy/design-system';
import { useApiClient } from '../../../lib/api-client';
import { useFamilyCaseId } from '../../../lib/use-family-case';

interface SharedContact {
  id: string;
  category: string;
  firstName: string;
  lastName?: string | null;
  relationship?: string | null;
  phone?: string | null;
  email?: string | null;
  note?: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  FAMILY: 'Famille',
  FRIEND: 'Ami·e',
  DOCTOR: 'Médecin',
  NOTARY: 'Notaire',
  BANK: 'Banque',
  INSURER: 'Assureur',
  EMPLOYER: 'Employeur',
  ACCOUNTANT: 'Comptable',
  LANDLORD: 'Propriétaire',
  VETERINARIAN: 'Vétérinaire',
  NEIGHBOR: 'Voisin·e',
  PRIORITY_CONTACT: 'Contact prioritaire',
  OTHER: 'Autre',
};

export default function FamilleContactsPage() {
  const api = useApiClient();
  const caseId = useFamilyCaseId();
  const [contacts, setContacts] = useState<SharedContact[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) return;
    api
      .get<SharedContact[]>(`/death-cases/${caseId}/contacts`)
      .then(setContacts)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur de chargement'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Contacts utiles</h1>
      <p className="mt-2 text-gray-600">
        Les contacts que votre proche avait choisi de partager avec vous.
      </p>

      <div className="mt-8">
        {!caseId && (
          <EmptyState title="Aucun dossier associé" description="Utilisez votre lien d'invitation pour accéder au dossier." />
        )}
        {caseId && error && <EmptyState title="Impossible de charger les contacts" description={error} />}
        {caseId && !error && contacts === null && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}
        {caseId && !error && contacts !== null && contacts.length === 0 && (
          <EmptyState
            title="Aucun contact partagé pour le moment"
            description="Votre proche n'avait pas partagé de contact, ou n'avait pas de dossier Legacy préparé."
          />
        )}
        {contacts !== null && contacts.length > 0 && (
          <ul className="space-y-3">
            {contacts.map((c) => (
              <li key={c.id} className="rounded-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-midnight">
                    {c.firstName} {c.lastName ?? ''}
                  </p>
                  <span className="text-xs uppercase tracking-wide text-sage">
                    {CATEGORY_LABELS[c.category] ?? c.category}
                  </span>
                </div>
                {c.relationship && <p className="text-sm text-gray-500">{c.relationship}</p>}
                <div className="mt-1 space-x-3 text-sm text-gray-600">
                  {c.phone && <a href={`tel:${c.phone}`}>{c.phone}</a>}
                  {c.email && <a href={`mailto:${c.email}`}>{c.email}</a>}
                </div>
                {c.note && <p className="mt-1 text-sm text-gray-500">{c.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
