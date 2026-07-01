'use client';

import { Button } from '@legacy/design-system';
import { getKeycloakAuthUrl } from '../lib/keycloak';

export function KeycloakRedirectButton({ register }: { register?: boolean }) {
  return (
    <Button
      size="lg"
      onClick={() => {
        const redirectUri = `${window.location.origin}/`;
        window.location.href = getKeycloakAuthUrl({ register, redirectUri });
      }}
    >
      {register ? 'Créer mon compte' : 'Se connecter'}
    </Button>
  );
}
