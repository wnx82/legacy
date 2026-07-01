import type { Metadata } from 'next';
import Link from 'next/link';
import { KeycloakRedirectButton } from '../../components/KeycloakRedirectButton';

export const metadata: Metadata = {
  title: 'Créer un compte',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-midnight">Créer votre compte Legacy</h1>
      <p className="mt-3 text-gray-600">
        Quelques informations suffisent pour commencer à préparer votre dossier, à votre rythme.
      </p>
      <div className="mt-8">
        <KeycloakRedirectButton register />
      </div>
      <p className="mt-6 text-sm text-gray-500">
        Déjà inscrit·e ?{' '}
        <Link href="/login" className="font-medium text-sage hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
