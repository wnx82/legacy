'use client';

import { usePathname } from 'next/navigation';
import { Sidebar, Header } from '@legacy/design-system';
import { useAuth } from '../lib/auth';

const NAV_ITEMS = [
  { label: 'Tableau de bord', href: '/dashboard' },
  { label: 'Dossiers décès', href: '/dossiers' },
  { label: 'Statistiques', href: '/statistiques' },
  { label: "Journal d'audit", href: '/journal' },
  { label: 'Collaborateurs', href: '/collaborateurs' },
  { label: 'Modèles de messages', href: '/modeles-messages' },
  { label: 'Modèles de checklist', href: '/modeles-checklist' },
  { label: 'Paramètres', href: '/parametres' },
  { label: 'Mon profil', href: '/profil' },
];

export function ProShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { initialized, authenticated, fullName, logout } = useAuth();

  if (!initialized) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Chargement de votre session…</div>;
  }
  if (!authenticated) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Redirection vers la connexion…</div>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar items={NAV_ITEMS.map((item) => ({ ...item, active: pathname?.startsWith(item.href) }))} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header>
          <p className="font-medium text-midnight">Portail professionnel Legacy</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{fullName}</span>
            <button onClick={logout} className="font-medium text-sage hover:underline">
              Déconnexion
            </button>
          </div>
        </Header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
