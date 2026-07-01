import Link from 'next/link';
import { Button } from '@legacy/design-system';

const NAV_LINKS = [
  { href: '/particuliers', label: 'Particuliers' },
  { href: '/familles', label: 'Familles' },
  { href: '/pompes-funebres', label: 'Pompes funèbres' },
  { href: '/fonctionnalites', label: 'Fonctionnalités' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/guides', label: 'Guides' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-semibold text-midnight">
          Legacy
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-midnight">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-medium text-gray-600 hover:text-midnight sm:block">
            Connexion
          </Link>
          <Link href="/register">
            <Button size="md">Préparer mon dossier</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
