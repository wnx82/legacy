import { createPkcePair } from './pkce';

export const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8080';
export const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? 'legacy';
export const KEYCLOAK_CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'legacy-website';

const OIDC_BASE = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect`;

export function getCallbackUrl(): string {
  return `${window.location.origin}/auth/callback`;
}

/**
 * Construit l'URL d'autorisation OpenID Connect (Authorization Code + PKCE)
 * et mémorise le "code verifier" pour l'échange effectué par
 * `app/auth/callback`. Keycloak reste l'unique fournisseur d'identité — le
 * site public ne gère jamais de mot de passe lui-même.
 */
export async function getKeycloakAuthUrl(options: { register?: boolean }): Promise<string> {
  const { challenge } = await createPkcePair();
  const path = options.register ? 'registrations' : 'auth';
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    redirect_uri: getCallbackUrl(),
    response_type: 'code',
    scope: 'openid profile email',
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });
  return `${OIDC_BASE}/${path}?${params.toString()}`;
}

export function getKeycloakLogoutUrl(redirectUri: string): string {
  const params = new URLSearchParams({ client_id: KEYCLOAK_CLIENT_ID, post_logout_redirect_uri: redirectUri });
  return `${OIDC_BASE}/logout?${params.toString()}`;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

/** Échange le code d'autorisation contre un token, en présentant le code_verifier PKCE (aucun secret client). */
export async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<TokenResponse> {
  const response = await fetch(`${OIDC_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KEYCLOAK_CLIENT_ID,
      code,
      redirect_uri: getCallbackUrl(),
      code_verifier: codeVerifier,
    }),
  });
  if (!response.ok) {
    throw new Error("Échec de l'authentification — le code a peut-être expiré, réessayez.");
  }
  return response.json();
}
