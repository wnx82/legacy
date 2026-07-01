'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Header, Footer } from '@legacy/design-system';
import { useAuth } from '../lib/auth';

const NAV_ITEMS = [
  { label: 'Accueil', href: '/' },
  { label: 'Démarches', href: '/dossier/checklist' },
  { label: 'Documents', href: '/dossier/documents' },
  { label: 'Messages', href: '/dossier/messages' },
  { label: 'Contacts utiles', href: '/dossier/contacts' },
  { label: 'Volontés', href: '/dossier/volontes' },
  { label: 'Export', href: '/dossier/export' },
  { label: 'Mon profil', href: '/profil' },
];

export function FamilyShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { initialized, authenticated, fullName, logout } = useAuth();

  if (!initialized) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Chargement…</div>;
  }
  if (!authenticated) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Redirection vers la connexion…</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header>
        <Link href="/" className="text-lg font-semibold text-midnight">
          Legacy — Espace famille
        </Link>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{fullName}</span>
          <button onClick={logout} className="font-medium text-sage hover:underline">
            Déconnexion
          </button>
        </div>
      </Header>
      <nav className="flex flex-wrap gap-1 border-b border-gray-100 bg-beige px-6 py-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'rounded-md px-3 py-2 text-sm font-medium',
              pathname === item.href ? 'bg-white text-midnight shadow-sm' : 'text-gray-600 hover:text-midnight',
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
      <Footer>
        Legacy ne remplace pas un notaire, un avocat ou un testament légal. Ces informations vous aident à vous
        organiser, elles ne constituent pas un acte légal.
      </Footer>
    </div>
  );
}
