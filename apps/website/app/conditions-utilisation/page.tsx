import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
};

export default function ConditionsUtilisationPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-midnight">Conditions d'utilisation</h1>
      <div className="prose prose-neutral mt-6 max-w-none text-gray-700">
        <p>Dernière mise à jour : 1 juillet 2026.</p>

        <h2>1. Objet</h2>
        <p>
          Les présentes conditions régissent l'utilisation de Legacy, plateforme d'assistant d'organisation, de
          coffre-fort documentaire et d'accompagnement administratif autour de la fin de vie et du décès.
        </p>

        <h2>2. Nature du service</h2>
        <p>
          Legacy ne remplace pas un notaire, un avocat, un testament légal ou un avis juridique. Les informations
          encodées servent à guider les proches et les professionnels, mais ne constituent pas un acte légal.
        </p>

        <h2>3. Comptes utilisateurs</h2>
        <p>
          Chaque utilisateur est responsable de la confidentialité de ses identifiants. L'authentification est
          assurée par Keycloak, avec authentification à deux facteurs obligatoire pour les comptes professionnels.
        </p>

        <h2>4. Utilisation par les pompes funèbres</h2>
        <p>
          Les organisations professionnelles s'engagent à n'utiliser les données des familles que dans le cadre
          strict de l'accompagnement du dossier décès, et à respecter les autorisations d'accès définies par les
          utilisateurs.
        </p>

        <h2>5. Résiliation</h2>
        <p>
          Chaque utilisateur peut supprimer son compte et ses données à tout moment, conformément à notre politique
          de confidentialité.
        </p>

        <h2>6. Responsabilité</h2>
        <p>
          Legacy met en œuvre les moyens raisonnables pour assurer la disponibilité et la sécurité du service, sans
          garantie de résultat absolu. Legacy ne saurait être tenu responsable des conséquences juridiques d'une
          absence de testament légal ou d'un acte notarié.
        </p>
      </div>
    </div>
  );
}
