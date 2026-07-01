'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card } from '@legacy/design-system';
import { getKeycloakLogoutUrl } from '../../lib/keycloak';

interface Me {
  firstName: string;
  lastName: string;
  email: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export default function ComptePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('legacy_access_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Session expirée, merci de vous reconnecter.');
        return res.json();
      })
      .then(setMe)
      .catch((err) => setError(err instanceof Error ? err.message : 'Une erreur est survenue.'));
  }, [router]);

  function handleLogout() {
    sessionStorage.removeItem('legacy_access_token');
    window.location.href = getKeycloakLogoutUrl(`${window.location.origin}/`);
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <Alert tone="danger" title="Session expirée">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-midnight">Mon compte</h1>

      {me && (
        <Card className="mt-6">
          <p className="font-medium text-midnight">
            Bienvenue, {me.firstName} {me.lastName}
          </p>
          <p className="mt-1 text-sm text-gray-500">{me.email}</p>
        </Card>
      )}

      <div className="mt-6">
        <Alert tone="info" title="Préparer votre dossier">
          Votre compte est créé. La préparation de votre dossier personnel (documents, volontés, contacts,
          personnes de confiance) se fait actuellement depuis l'application Legacy (Android, iOS, Windows, macOS,
          Linux).
        </Alert>
      </div>

      <Button variant="ghost" className="mt-8" onClick={handleLogout}>
        Se déconnecter
      </Button>
    </div>
  );
}
