import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Legacy',
    links: [
      { href: '/a-propos', label: 'À propos' },
      { href: '/securite', label: 'Sécurité' },
      { href: '/contact', label: 'Contact' },
      { href: '/demo', label: 'Demander une démo' },
    ],
  },
  {
    title: 'Public',
    links: [
      { href: '/particuliers', label: 'Particuliers' },
      { href: '/familles', label: 'Familles' },
      { href: '/pompes-funebres', label: 'Pompes funèbres' },
      { href: '/guides', label: 'Guides' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { href: '/mentions-legales', label: 'Mentions légales' },
      { href: '/confidentialite', label: 'Confidentialité' },
      { href: '/conditions-utilisation', label: "Conditions d'utilisation" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-beige px-6 py-12 text-sm text-gray-500">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
        <div>
          <p className="text-lg font-semibold text-midnight">Legacy</p>
          <p className="mt-2 max-w-xs">« Préparer l'après, accompagner ceux qu'on aime. »</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="font-medium text-midnight">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-midnight hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-gray-200 pt-6 text-xs">
        <p>
          Legacy ne remplace pas un notaire, un avocat, un testament légal ou un avis juridique. Les informations
          encodées servent à guider les proches et les professionnels, mais ne constituent pas un acte légal.
        </p>
        <p className="mt-2">© {new Date().getFullYear()} Legacy. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
