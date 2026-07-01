'use client';

import { useCurrentUser } from '../../lib/use-current-user';
import { useAuth } from '../../lib/auth';
import { Card } from '@legacy/design-system';

export default function ProfilPage() {
  const { user } = useCurrentUser();
  const { roles } = useAuth();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold text-midnight">Mon profil</h1>
      {user && (
        <Card className="mt-6">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Nom</dt>
              <dd className="font-medium text-midnight">
                {user.firstName} {user.lastName}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">E-mail</dt>
              <dd className="font-medium text-midnight">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Rôles</dt>
              <dd className="font-medium text-midnight">{roles.join(', ') || '—'}</dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}
