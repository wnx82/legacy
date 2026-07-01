import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Alert } from '@legacy/design-system';

export const metadata: Metadata = {
  title: 'Pour les particuliers',
  description:
    'Préparez vos informations importantes de votre vivant : documents, volontés, contacts, personnes de confiance.',
};

const SECTIONS = [
  { title: 'Informations personnelles', description: 'Vos coordonnées, votre situation, ce qui est utile à vos proches.' },
  { title: 'Documents importants', description: "Cartes d'identité, contrats, actes — centralisés et chiffrés." },
  { title: 'Volontés non légales', description: 'Vos souhaits pour la cérémonie, sans valeur de testament.' },
  { title: 'Contacts importants', description: 'Médecin, notaire, banque, employeur — toujours à portée de main.' },
  { title: 'Personnes de confiance', description: 'Celles et ceux qui pourront accéder à vos informations si besoin.' },
  { title: 'Patrimoine, assurances, abonnements', description: 'Une vue claire pour éviter les oublis à vos proches.' },
  { title: 'Animaux', description: 'Consignes pour que vos compagnons soient bien pris en charge.' },
];

export default function ParticuliersPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-midnight">Préparer son dossier personnel</h1>
      <p className="mt-4 text-lg text-gray-600">
        Un espace privé, simple et guidé, pour organiser ce qui compte — sans démarche légale, à votre rythme.
      </p>

      <div className="mt-8">
        <Alert tone="info" title="Bon à savoir">
          Legacy ne remplace pas un notaire, un avocat, un testament légal ou un avis juridique. Les informations
          encodées servent à guider vos proches, mais ne constituent pas un acte légal.
        </Alert>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-lg border border-gray-200 p-5">
            <p className="font-medium text-midnight">{s.title}</p>
            <p className="mt-2 text-sm text-gray-600">{s.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/register">
          <Button size="lg">Préparer mon dossier</Button>
        </Link>
      </div>
    </div>
  );
}
