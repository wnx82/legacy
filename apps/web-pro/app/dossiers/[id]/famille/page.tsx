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
  const inputClassName = 'w-full rounded-md border border-gray-300 p-2.5';

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

      <form onSubmit={handleInvite} className="mt-6 rounded-lg border border-gray-200 p-4" aria-describedby="invite-help">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1">
            <span className="text-sm font-medium text-midnight">E-mail du proche</span>
            <input
              required
              type="email"
              autoComplete="email"
              placeholder="E-mail du proche"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClassName}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-midnight">Prénom</span>
            <input
              autoComplete="given-name"
              placeholder="Prénom"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className={inputClassName}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-midnight">Nom</span>
            <input
              autoComplete="family-name"
              placeholder="Nom"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className={inputClassName}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-midnight">Lien de parenté</span>
            <input
              placeholder="Lien de parenté"
              value={form.relationship}
              onChange={(e) => setForm({ ...form, relationship: e.target.value })}
              className={inputClassName}
            />
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p id="invite-help" className="text-sm text-gray-500">
            Une invitation sécurisée sera envoyée automatiquement à cette adresse.
          </p>
          <Button type="submit">Inviter</Button>
        </div>
      </form>

      <p className="mt-3 text-xs text-gray-400">
        Un e-mail d'invitation sécurisé (lien personnel à usage unique, valable 14 jours) est
        envoyé automatiquement au proche. Il n'y a plus de lien à transmettre manuellement.
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
