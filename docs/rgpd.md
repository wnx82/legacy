# RGPD

Legacy traite des données personnelles au sens du RGPD, y compris des
catégories particulières (santé, dans certains cas). Ce document résume
l'approche de conformité et ce qui reste à finaliser avant une mise en
production réelle.

## Principes appliqués

- **Minimisation** : chaque module ne collecte que les champs listés dans
  le cahier des charges produit (`product.md`) ; pas de champ « au cas où ».
- **Finalité claire** : les données du dossier vivant servent à préparer et
  transmettre des informations ; elles ne sont jamais réutilisées à des
  fins commerciales sans consentement explicite (`Consent`, type
  `MARKETING`).
- **Visibilité contrôlée par l'utilisateur** : la plupart des entités
  sensibles (`Contact`, `Asset`, `Insurance`) portent des indicateurs
  `visibleToFamily`/`visibleToPro` explicites, avec des valeurs par défaut
  restrictives (`false` pour le patrimoine et les assurances).
- **Consentement versionné** : `Consent` et `LegalDisclaimerAcceptance`
  enregistrent la version des CGU/politique de confidentialité acceptée et
  la date, pas seulement un booléen.

## Droits des personnes

| Droit | Mécanisme prévu |
| --- | --- |
| Accès | `GET /auth/me`, `GET /living-profile` et endpoints associés |
| Rectification | `PATCH` sur chaque ressource (dossier vivant, contacts, volontés…) |
| Portabilité / export | `POST /exports/pdf` (PDF), **`POST /exports/rgpd`** (export JSON complet via `RgpdExportProcessor`, résultat téléchargeable via `GET /exports/:id/download`) |
| Effacement | **`DELETE /accounts/me`** (confirmation `SUPPRIMER` requise) : effacement réel du dossier vivant en cascade + purge MinIO + anonymisation du compte |
| Opposition | Désactivation des notifications marketing via `Consent` |

**État actuel :** l'export RGPD complet et la suppression de compte sont
désormais **implémentés** (`feat/rgpd-and-account-deletion`).

- **Export RGPD** (`api/src/modules/queue/processors/rgpd-export.processor.ts`) :
  rassemble compte, adhésions, consentements, dossier vivant complet
  (documents, volontés, contacts, patrimoine, assurances, abonnements, animaux)
  et journaux d'audit dans un JSON, uploadé dans MinIO. Aucun secret (les mots
  de passe sont gérés par Keycloak, jamais côté API).
- **Suppression de compte** (`api/src/modules/accounts/accounts.service.ts`) :
  suppression transactionnelle du dossier vivant (cascade Prisma) + des
  notifications/consentements/adhésions/accès reçus, purge des objets MinIO
  associés, puis **anonymisation** de l'enregistrement `User` (e-mail, noms,
  téléphone, identifiant Keycloak neutralisés). L'anonymisation — plutôt qu'une
  suppression physique — préserve l'intégrité des journaux d'audit et des
  dossiers décès à conserver pour raisons légales, tout en effaçant l'identité.

**Action manuelle restante :** désactiver le compte correspondant côté Keycloak
(source de vérité de l'identité) — non automatisé dans ce dépôt (nécessite les
accès admin Keycloak). Voir `deployment.md`.

## Sous-traitants et hébergement

- **Hébergement recommandé au sein de l'Union européenne** (voir
  `deployment.md`) — choix documenté mais non contractuel dans ce dépôt.
- **MinIO auto-hébergé** plutôt qu'un service cloud tiers par défaut : pas
  de transfert de données vers un sous-traitant supplémentaire tant que le
  déploiement reste auto-hébergé.
- **Umami auto-hébergé** pour les statistiques du site public : aucune
  donnée personnelle collectée, aucun cookie déposé, donc aucun bandeau de
  consentement requis pour cet usage précis. Si un autre outil de mesure
  d'audience est ajouté par la suite, revoir cette section.
- **Mailhog en développement uniquement** : ne jamais utiliser en
  production (voir `deployment.md` pour un SMTP réel).

## Registre des traitements (à compléter)

Avant toute mise en production, documenter formellement (hors de ce dépôt
technique, dans un registre RGPD) :

- Les finalités précises de chaque module de données.
- Les durées de conservation par type de donnée.
- Le sous-traitant d'hébergement retenu et sa localisation.
- La procédure de notification en cas de violation de données.

## Mentions obligatoires déjà en place

- Avertissement légal sur le module Volontés (`LEGACY_WISHES_DISCLAIMER`,
  `packages/shared/src/constants/legal.ts`), affiché dans le site public,
  le portail pro et l'app Flutter (`LegalDisclaimerBanner`).
- Page `/confidentialite` et `/conditions-utilisation` sur le site public.
