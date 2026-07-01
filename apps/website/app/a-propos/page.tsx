import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À propos',
  description: 'La mission de Legacy : préparer l’après, accompagner ceux qu’on aime.',
};

export default function AProposPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-midnight">À propos de Legacy</h1>
      <div className="prose prose-neutral mt-6 max-w-none text-gray-700">
        <p>
          Legacy est né d'un constat simple : au moment d'un décès, les familles se retrouvent souvent démunies —
          documents introuvables, volontés inconnues, démarches innombrables. Nous pensons qu'un peu de préparation,
          de son vivant, peut transformer une épreuve en un accompagnement plus serein.
        </p>
        <p>
          Legacy n'est pas un service juridique. C'est un assistant d'organisation, un coffre-fort documentaire et un
          outil de transmission d'informations, pensé pour être humain, rassurant et respectueux.
        </p>
        <p>
          Nous travaillons aussi avec les pompes funèbres, qui accompagnent chaque jour des familles en deuil, pour
          leur offrir un outil numérique moderne, sans jamais remplacer la relation humaine qui est au cœur de leur
          métier.
        </p>
      </div>
    </div>
  );
}
