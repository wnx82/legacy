/**
 * PKCE (Proof Key for Code Exchange, RFC 7636) pour le flux Authorization
 * Code côté navigateur — recommandé pour tout client public OpenID Connect,
 * y compris lorsque Keycloak ne l'exige pas explicitement pour ce client.
 */

const STORAGE_KEY = 'legacy_pkce_verifier';

function base64UrlEncode(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes.buffer);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlEncode(digest);
}

/** Génère une paire verifier/challenge et mémorise le verifier pour l'échange du code au retour. */
export async function createPkcePair(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateCodeVerifier();
  sessionStorage.setItem(STORAGE_KEY, verifier);
  const challenge = await generateCodeChallenge(verifier);
  return { verifier, challenge };
}

export function consumeStoredCodeVerifier(): string | null {
  const verifier = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  return verifier;
}
