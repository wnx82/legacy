import { Alert, EmptyState } from '@legacy/design-system';

/**
 * Comme pour les contacts, les volontés partagées nécessitent un endpoint
 * dédié pour exposer en toute sécurité les Wish d'un dossier vivant lié à un
 * dossier décès (voir docs/roadmap.md, Phase 2).
 */
export default function FamilleVolontesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-midnight">Volontés partagées</h1>
      <p className="mt-2 text-gray-600">
        Les souhaits que votre proche avait exprimés (cérémonie, musiques, messages) apparaîtront ici s'il les a
        partagés.
      </p>

      <div className="mt-6">
        <Alert tone="info">
          Ces informations, lorsqu'elles existent, ne remplacent pas un testament légal, un acte notarié ou un avis
          juridique.
        </Alert>
      </div>

      <div className="mt-8">
        <EmptyState title="Aucune volonté partagée pour le moment" />
      </div>
    </div>
  );
}
