import type { Metadata } from 'next';
import { Alert } from '@legacy/design-system';

export const metadata: Metadata = {
  title: 'Sécurité',
  description: 'Chiffrement, accès contrôlés, journalisation, RGPD — la sécurité de vos données est notre priorité.',
};

const MEASURES = [
  { title: 'Chiffrement', description: 'Documents chiffrés au repos ; connexions chiffrées en transit (TLS).' },
  { title: 'Accès contrôlés', description: "Principe du moindre privilège : chacun n'accède qu'à ce qui le concerne." },
  { title: 'Journalisation', description: 'Chaque consultation ou téléchargement sensible est journalisé.' },
  { title: 'Authentification renforcée', description: '2FA obligatoire pour les comptes professionnels (Keycloak).' },
  { title: 'Liens temporaires', description: 'Les liens de téléchargement sont signés et expirent automatiquement.' },
  { title: 'Séparation des organisations', description: 'Aucune pompe funèbre ne peut accéder aux données d’une autre.' },
  { title: 'Sauvegardes chiffrées', description: 'Sauvegardes régulières, chiffrées, testées.' },
  { title: 'Hébergement européen', description: 'Hébergement recommandé au sein de l’Union européenne (RGPD).' },
];

export default function SecuritePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-midnight">La sécurité de vos données</h1>
      <p className="mt-4 text-lg text-gray-600">
        Legacy traite des informations sensibles, familiales et parfois patrimoniales. Voici les mesures mises en
        place pour les protéger.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {MEASURES.map((m) => (
          <div key={m.title} className="rounded-lg border border-gray-200 p-5">
            <p className="font-medium text-midnight">{m.title}</p>
            <p className="mt-2 text-sm text-gray-600">{m.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Alert tone="info" title="RGPD">
          Vous disposez à tout moment d'un droit d'accès, de rectification, d'export et de suppression de vos
          données. Voir notre page{' '}
          <a href="/confidentialite" className="underline">
            Confidentialité
          </a>
          .
        </Alert>
      </div>
    </div>
  );
}
