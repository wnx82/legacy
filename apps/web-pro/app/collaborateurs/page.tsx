'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, EmptyState } from '@legacy/design-system';
import { useApiClient } from '../../lib/api-client';
import { useCurrentUser } from '../../lib/use-current-user';

interface Member {
  id: string;
  baseRole: string;
  status: string;
  user: { firstName: string; lastName: string; email: string };
}

export default function CollaborateursPage() {
  const api = useApiClient();
  const { organizationId } = useCurrentUser();
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState('');

  function refresh() {
    if (!organizationId) return;
    api.get<Member[]>(`/organizations/${organizationId}/members`).then(setMembers);
  }

  useEffect(refresh, [organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organizationId) return;
    await api.post(`/organizations/${organizationId}/members`, { email, baseRole: 'FUNERAL_ADVISOR' });
    setEmail('');
    refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Collaborateurs</h1>
      <form onSubmit={handleInvite} className="mt-6 flex gap-3">
        <input
          required
          type="email"
          placeholder="E-mail du collaborateur"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-80 rounded-md border border-gray-300 p-2.5"
        />
        <Button type="submit">Inviter</Button>
      </form>

      <div className="mt-8">
        {members.length === 0 ? (
          <EmptyState title="Aucun collaborateur pour le moment" />
        ) : (
          <ul className="space-y-3">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded-md border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-midnight">
                    {m.user.firstName} {m.user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{m.user.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge tone="info">{m.baseRole}</Badge>
                  <Badge tone={m.status === 'ACTIVE' ? 'success' : 'neutral'}>{m.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
