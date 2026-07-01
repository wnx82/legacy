import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import { ProShell } from '../components/ProShell';

export const metadata: Metadata = {
  title: { default: 'Legacy Pro', template: '%s · Legacy Pro' },
  description: 'Portail professionnel Legacy pour les pompes funèbres.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <ProShell>{children}</ProShell>
        </AuthProvider>
      </body>
    </html>
  );
}
