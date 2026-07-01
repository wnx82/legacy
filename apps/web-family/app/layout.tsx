import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import { FamilyShell } from '../components/FamilyShell';

export const metadata: Metadata = {
  title: { default: 'Espace famille Legacy', template: '%s · Legacy Famille' },
  description: 'Suivez les démarches après un décès, en toute simplicité.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <Suspense>
            <FamilyShell>{children}</FamilyShell>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
