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
| Portabilité / export | `POST /exports/pdf` (PDF), `ExportJobType.RGPD_EXPORT` modélisé — **processeur d'export RGPD complet à implémenter en Phase 2** |
| Effacement | Suppression de compte à implémenter en Phase 2 (job de suppression réelle des données liées, pas un simple flag) |
| Opposition | Désactivation des notifications marketing via `Consent` |

**État actuel (MVP) :** le schéma de données et les endpoints de lecture/
écriture sont en place ; le job d'export RGPD complet et la suppression de
compte en cascade (avec purge MinIO) sont des chantiers de Phase 2 — voir
`roadmap.md`. Ne pas annoncer ces fonctionnalités comme actives auprès
d'utilisateurs réels tant qu'elles ne sont pas implémentées.

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
