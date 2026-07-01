'use client';

import { useEffect, useState } from 'react';
import { useApiClient } from './api-client';
import { useAuth } from './auth';

interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  memberships: { organizationId: string; organization: { id: string; name: string } }[];
}

export function useCurrentUser() {
  const { authenticated } = useAuth();
  const api = useApiClient();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) return;
    api
      .get<CurrentUser>('/auth/me')
      .then(setUser)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  const organizationId = user?.memberships?.[0]?.organizationId;
  return { user, organizationId, loading };
}
