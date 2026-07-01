'use client';

import { useState } from 'react';
import { Button } from '@legacy/design-system';
import { getKeycloakAuthUrl } from '../lib/keycloak';

export function KeycloakRedirectButton({ register }: { register?: boolean }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      size="lg"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        window.location.href = await getKeycloakAuthUrl({ register });
      }}
    >
      {loading ? 'Redirection…' : register ? 'Créer mon compte' : 'Se connecter'}
    </Button>
  );
}
