'use client';

import { useEffect, useState } from 'react';
import { Card } from '@legacy/design-system';
import { useApiClient } from '../../lib/api-client';

interface Me {
  firstName: string;
  lastName: string;
  email: string;
}

export default function ProfilInvitePage() {
  const api = useApiClient();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    api.get<Me>('/auth/me').then(setMe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Mon profil</h1>
      {me && (
        <Card className="mt-6 max-w-md">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Nom</dt>
              <dd className="font-medium text-midnight">
                {me.firstName} {me.lastName}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">E-mail</dt>
              <dd className="font-medium text-midnight">{me.email}</dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}
