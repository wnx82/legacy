import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@legacy/design-system';

export const metadata: Metadata = {
  title: 'Pour les familles',
  description: "Un espace guidé pour suivre les démarches après un décès, sans se sentir seul.",
};

const POINTS = [
  { title: 'Démarches à effectuer', description: 'Une checklist claire, adaptée à votre situation.' },
  { title: 'Documents à retrouver ou envoyer', description: 'Sachez exactement ce qui manque.' },
  { title: 'Informations partagées', description: "Volontés, contacts utiles, ce que la personne a préparé pour vous." },
  { title: 'Suivi des formalités', description: "L'état d'avancement de chaque étape, en un coup d'œil." },
  { title: 'Collaboration avec la pompe funèbre', description: 'Messages, demandes de documents, notes partagées.' },
];

export default function FamillesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-midnight">Être accompagné après un décès</h1>
      <p className="mt-4 text-lg text-gray-600">
        Legacy vous guide pas à pas, avec des explications claires et sans jargon, pour ne rien oublier dans une
        période déjà difficile.
      </p>

      <div className="mt-10 space-y-6">
        {POINTS.map((p) => (
          <div key={p.title} className="rounded-lg border border-gray-200 p-5">
            <p className="font-medium text-midnight">{p.title}</p>
            <p className="mt-2 text-sm text-gray-600">{p.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-lg bg-beige p-6 text-center">
        <p className="text-gray-700">Vous avez été invité·e par une pompe funèbre ou un proche ?</p>
        <Link href="/login" className="mt-4 inline-block">
          <Button variant="secondary">Accéder à mon espace famille</Button>
        </Link>
      </div>
    </div>
  );
}
