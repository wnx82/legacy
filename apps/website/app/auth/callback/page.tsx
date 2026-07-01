'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '@legacy/design-system';
import { exchangeCodeForToken } from '../../../lib/keycloak';
import { consumeStoredCodeVerifier } from '../../../lib/pkce';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  // Le code d'autorisation n'est utilisable qu'une seule fois : évite un
  // double échange en développement (React StrictMode invoque les effets
  // deux fois) qui ferait échouer la seconde tentative.
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const code = searchParams.get('code');
    const keycloakError = searchParams.get('error_description') ?? searchParams.get('error');

    if (keycloakError) {
      setError(keycloakError);
      return;
    }
    if (!code) {
      setError("Aucun code d'autorisation reçu. Merci de relancer la connexion depuis /login.");
      return;
    }

    const verifier = consumeStoredCodeVerifier();
    if (!verifier) {
      setError('Session de connexion expirée. Merci de réessayer.');
      return;
    }

    exchangeCodeForToken(code, verifier)
      .then((token) => {
        sessionStorage.setItem('legacy_access_token', token.access_token);
        router.replace('/compte');
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Échec de l'authentification."));
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <Alert tone="danger" title="Connexion impossible">
          {error}
        </Alert>
      </div>
    );
  }

  return <div className="flex min-h-[60vh] items-center justify-center text-gray-500">Connexion en cours…</div>;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-gray-500">Chargement…</div>}>
      <CallbackContent />
    </Suspense>
  );
}
