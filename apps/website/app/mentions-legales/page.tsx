import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales',
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-midnight">Mentions légales</h1>
      <div className="prose prose-neutral mt-6 max-w-none text-gray-700">
        <h2>Éditeur du site</h2>
        <p>
          Legacy — [Dénomination sociale à compléter], [forme juridique], dont le siège social est situé
          [adresse à compléter], immatriculée sous le numéro [numéro d'entreprise à compléter].
        </p>
        <p>Adresse e-mail de contact : contact@legacy.example</p>

        <h2>Directeur de la publication</h2>
        <p>[Nom du responsable de publication à compléter]</p>

        <h2>Hébergement</h2>
        <p>
          Le site et l'application Legacy sont hébergés au sein de l'Union européenne (hébergeur à préciser lors de
          la mise en production — voir <code>docs/deployment.md</code>).
        </p>

        <h2>Nature du service</h2>
        <p>
          Legacy est un assistant d'organisation, un coffre-fort documentaire et un outil de transmission
          d'informations. Legacy ne remplace pas un notaire, un avocat, un testament légal ou un avis juridique. Les
          informations encodées servent à guider les proches et les professionnels, mais ne constituent pas un acte
          légal.
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus présents sur ce site (textes, graphismes, logo) sont la propriété de Legacy, sauf
          mention contraire, et ne peuvent être reproduits sans autorisation préalable.
        </p>
      </div>
    </div>
  );
}
