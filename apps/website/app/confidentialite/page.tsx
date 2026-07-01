import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Confidentialité',
  description: 'Politique de confidentialité et conformité RGPD de Legacy.',
};

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-midnight">Politique de confidentialité</h1>
      <div className="prose prose-neutral mt-6 max-w-none text-gray-700">
        <p>Dernière mise à jour : 1 juillet 2026.</p>

        <h2>Quelles données collectons-nous ?</h2>
        <p>
          Informations d'identification (nom, prénom, e-mail), informations que vous choisissez d'ajouter à votre
          dossier (documents, contacts, volontés, patrimoine), données techniques nécessaires au fonctionnement du
          service (journaux de connexion et d'accès).
        </p>

        <h2>Pourquoi ces données ?</h2>
        <p>
          Pour vous permettre de préparer votre dossier, pour permettre à vos proches ou à une pompe funèbre d'être
          guidés après un décès (selon les autorisations que vous accordez), et pour assurer la sécurité du service.
        </p>

        <h2>Qui peut voir vos données ?</h2>
        <p>
          Vous seul·e, par défaut. Les personnes de confiance ou membres de la famille n'y accèdent que si vous
          l'avez explicitement autorisé, ou après activation contrôlée d'un accès après décès (voir
          <code> docs/security.md</code>).
        </p>

        <h2>Vos droits (RGPD)</h2>
        <ul>
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement</li>
          <li>Droit à la portabilité (export de vos données)</li>
          <li>Droit d'opposition</li>
        </ul>
        <p>Pour exercer ces droits : contact@legacy.example, ou directement depuis votre espace personnel.</p>

        <h2>Conservation des données</h2>
        <p>
          Vos données sont conservées tant que votre compte est actif. En cas de suppression, les données sont
          définitivement effacées dans un délai raisonnable, hors obligations légales de conservation.
        </p>

        <h2>Hébergement</h2>
        <p>Hébergement recommandé au sein de l'Union européenne.</p>

        <h2>Statistiques</h2>
        <p>
          Nous utilisons Umami, un outil de mesure d'audience auto-hébergé qui ne dépose aucun cookie et ne collecte
          aucune donnée personnelle identifiable.
        </p>
      </div>
    </div>
  );
}
