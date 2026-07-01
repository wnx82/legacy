import { EmptyState } from '@legacy/design-system';

/**
 * Les contacts utiles proviennent du dossier vivant du défunt (ceux marqués
 * "visibles par la famille"). L'API expose aujourd'hui les contacts d'un
 * dossier vivant uniquement à son propriétaire ; un endpoint dédié
 * (ex: GET /death-cases/:id/contacts) est nécessaire pour les exposer ici en
 * toute sécurité — prévu en Phase 2 (voir docs/roadmap.md).
 */
export default function FamilleContactsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Contacts utiles</h1>
      <p className="mt-2 text-gray-600">
        Les contacts que votre proche avait choisi de partager avec vous apparaîtront ici.
      </p>
      <div className="mt-8">
        <EmptyState
          title="Aucun contact partagé pour le moment"
          description="Si votre proche avait préparé un dossier Legacy, ses contacts partagés seront visibles ici prochainement."
        />
      </div>
    </div>
  );
}
