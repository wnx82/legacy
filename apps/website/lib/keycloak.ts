const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8080';
const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? 'legacy';
const KEYCLOAK_CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'legacy-website';

/**
 * Construit l'URL d'autorisation OpenID Connect (Authorization Code + PKCE
 * recommandé côté client). Keycloak reste l'unique fournisseur d'identité —
 * le site public ne gère jamais de mot de passe lui-même.
 */
export function getKeycloakAuthUrl(options: { register?: boolean; redirectUri: string }): string {
  const base = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect`;
  const path = options.register ? 'registrations' : 'auth';
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    redirect_uri: options.redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
  });
  return `${base}/${path}?${params.toString()}`;
}
