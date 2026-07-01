import type { Metadata } from 'next';
import Link from 'next/link';
import { KeycloakRedirectButton } from '../../components/KeycloakRedirectButton';

export const metadata: Metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-midnight">Connexion à Legacy</h1>
      <p className="mt-3 text-gray-600">
        L'authentification est gérée de manière sécurisée par notre fournisseur d'identité (Keycloak).
      </p>
      <div className="mt-8">
        <KeycloakRedirectButton />
      </div>
      <p className="mt-6 text-sm text-gray-500">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-medium text-sage hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
