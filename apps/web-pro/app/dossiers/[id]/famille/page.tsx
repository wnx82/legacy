'use client';

import { useEffect, useState } from 'react';
import { Button, EmptyState, Badge } from '@legacy/design-system';
import { useApiClient } from '../../../../lib/api-client';
import { DossierTabs } from '../../../../components/DossierTabs';

interface FamilyInvite {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  relationship?: string;
  status: string;
}

export default function DossierFamillePage({ params }: { params: { id: string } }) {
  const api = useApiClient();
  const [invites, setInvites] = useState<FamilyInvite[]>([]);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', relationship: '' });

  function refresh() {
    api.get<FamilyInvite[]>(`/death-cases/${params.id}/family`).then(setInvites);
  }

  useEffect(refresh, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post(`/death-cases/${params.id}/family`, form);
    setForm({ email: '', firstName: '', lastName: '', relationship: '' });
    refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Dossier décès</h1>
      <div className="mt-6">
        <DossierTabs id={params.id} />
      </div>

      <form onSubmit={handleInvite} className="mt-6 flex flex-wrap gap-3 rounded-lg border border-gray-200 p-4">
        <input
          required
          placeholder="E-mail du proche"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-md border border-gray-300 p-2.5"
        />
        <input
          placeholder="Prénom"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          className="rounded-md border border-gray-300 p-2.5"
        />
        <input
          placeholder="Nom"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          className="rounded-md border border-gray-300 p-2.5"
        />
        <input
          placeholder="Lien de parenté"
          value={form.relationship}
          onChange={(e) => setForm({ ...form, relationship: e.target.value })}
          className="rounded-md border border-gray-300 p-2.5"
        />
        <Button type="submit">Inviter</Button>
      </form>

      <p className="mt-3 text-xs text-gray-400">
        Lien d'accès à partager une fois l'invitation acceptée :{' '}
        {(process.env.NEXT_PUBLIC_WEB_FAMILY_URL ?? 'http://localhost:3003') + `/?dossier=${params.id}`}
      </p>

      <div className="mt-6">
        {invites.length === 0 ? (
          <EmptyState title="Aucun proche invité pour le moment" />
        ) : (
          <ul className="space-y-3">
            {invites.map((invite) => (
              <li key={invite.id} className="flex items-center justify-between rounded-md border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-midnight">
                    {invite.firstName} {invite.lastName} — {invite.email}
                  </p>
                  <p className="text-sm text-gray-500">{invite.relationship}</p>
                </div>
                <Badge tone={invite.status === 'ACCEPTED' ? 'success' : 'neutral'}>{invite.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
