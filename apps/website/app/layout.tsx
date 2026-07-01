import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { UmamiScript } from '../components/UmamiScript';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.WEBSITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Legacy — Préparer l’après, accompagner ceux qu’on aime',
    template: '%s · Legacy',
  },
  description:
    "Legacy aide les particuliers à organiser leurs informations importantes de leur vivant, les familles à " +
    'suivre les démarches après un décès, et les pompes funèbres à accompagner leurs clients avec un outil ' +
    'numérique simple et sécurisé.',
  openGraph: {
    title: 'Legacy — Préparer l’après, accompagner ceux qu’on aime',
    description: "Coffre-fort documentaire, préparation personnelle et accompagnement administratif après un décès.",
    siteName: 'Legacy',
    locale: 'fr_BE',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <UmamiScript />
      </body>
    </html>
  );
}
