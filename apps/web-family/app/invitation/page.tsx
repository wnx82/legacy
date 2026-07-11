'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Button, EmptyState } from '@legacy/design-system';
import { useApiClient } from '../../lib/api-client';
import { useAuth } from '../../lib/auth';
import { STORAGE_KEY } from '../../lib/use-family-case';

interface InviteInfo {
  status: string;
  expired: boolean;
  deceasedFirstName: string;
  deceasedLastName: string;
  organizationName?: string | null;
}

/**
 * Page d'atterrissage du lien d'invitation famille (`/invitation?token=...`).
 * L'espace famille impose déjà une session Keycloak : à ce stade le proche est
 * donc connecté. On accepte alors l'invitation, on mémorise le dossier lié et
 * on redirige vers l'accueil.
 */
export default function InvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const api = useApiClient();
  const { initialized, authenticated, token: authToken } = useAuth();
  const inviteToken = searchParams.get('token');
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const acceptedRef = useRef(false);

  useEffect(() => {
    if (!inviteToken) {
      setError("Lien d'invitation incomplet.");
      return;
    }
    api
      .get<InviteInfo>(`/family-invites/${inviteToken}`)
      .then(setInfo)
      .catch(() => setError("Cette invitation est introuvable ou a expiré."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteToken]);

  useEffect(() => {
    if (!inviteToken || !initialized || !authenticated || !authToken) return;
    if (!info || info.expired || acceptedRef.current) return;
    acceptedRef.current = true;
    setAccepting(true);
    api
      .post<{ deathCaseId: string }>(`/family-invites/${inviteToken}/accept`)
      .then(({ deathCaseId }) => {
        localStorage.setItem(STORAGE_KEY, deathCaseId);
        router.replace('/');
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Impossible d'accepter l'invitation."))
      .finally(() => setAccepting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteToken, initialized, authenticated, authToken, info]);

  if (error) {
    return (
      <EmptyState
        title="Invitation indisponible"
        description={error}
      />
    );
  }

  if (info?.expired) {
    return (
      <EmptyState
        title="Invitation expirée"
        description="Ce lien n'est plus valide. Demandez à la pompe funèbre de vous renvoyer une invitation."
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 py-10 text-center">
      <h1 className="text-2xl font-semibold text-midnight">
        {info
          ? `Dossier de ${info.deceasedFirstName} ${info.deceasedLastName}`
          : 'Vérification de votre invitation…'}
      </h1>
      {info?.organizationName && (
        <p className="text-gray-600">Accompagnement assuré par {info.organizationName}.</p>
      )}
      <Alert tone="info" title="Accès sécurisé">
        {accepting
          ? 'Validation de votre accès en cours…'
          : 'Votre accès va être activé automatiquement. Vous serez redirigé·e vers le dossier.'}
      </Alert>
      <Button variant="secondary" onClick={() => router.replace('/')}>
        Accéder au dossier
      </Button>
    </div>
  );
}
