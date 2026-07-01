import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@legacy/design-system';

export const metadata: Metadata = {
  title: 'Pour les pompes funèbres',
  description: 'Un portail professionnel pour accompagner vos familles et moderniser votre activité.',
};

const POINTS = [
  'Créer un dossier décès en quelques minutes.',
  'Inviter la famille et centraliser les documents.',
  'Suivre les formalités avec une checklist configurable.',
  'Proposer Legacy en prévoyance à vos clients vivants.',
  'Personnaliser votre espace avec votre logo et vos couleurs.',
  'Gérer vos collaborateurs et leurs permissions.',
];

export default function PompesFunebresPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-midnight">Un portail professionnel moderne</h1>
      <p className="mt-4 text-lg text-gray-600">
        Accompagnez vos familles avec un outil numérique clair, tout en gardant la relation humaine au centre de
        votre métier.
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {POINTS.map((p) => (
          <li key={p} className="rounded-md border border-gray-200 p-4 text-sm text-gray-700">
            {p}
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-col items-center gap-4 rounded-lg bg-midnight p-8 text-center text-white sm:flex-row sm:justify-between">
        <p className="text-lg font-medium">Découvrez Legacy Pro en 20 minutes.</p>
        <Link href="/demo">
          <Button size="lg" variant="secondary">
            Demander une démo
          </Button>
        </Link>
      </div>
    </div>
  );
}
