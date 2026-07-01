# Vision produit

## Positionnement

Legacy **n'est pas** un testament légal. C'est :

- un assistant d'organisation ;
- un coffre-fort documentaire ;
- un outil de préparation personnelle ;
- un outil de transmission d'informations ;
- une plateforme d'accompagnement administratif ;
- un portail professionnel pour les pompes funèbres ;
- un espace d'aide pour les familles.

**Avertissement légal obligatoire**, à afficher dans l'application, sur le
site et dans le module Volontés :

> Legacy ne remplace pas un notaire, un avocat, un testament légal ou un
> avis juridique. Les informations encodées servent à guider les proches et
> les professionnels, mais ne constituent pas un acte légal.

Cette phrase est centralisée dans
`packages/shared/src/constants/legal.ts` (`LEGACY_LEGAL_DISCLAIMER`,
`LEGACY_WISHES_DISCLAIMER`) — toute nouvelle interface affichant des
volontés ou des informations de succession doit la réutiliser plutôt que la
retaper.

## Ton et positionnement de marque

Le produit doit toujours rester : humain, rassurant, sobre, professionnel,
empathique, clair, respectueux, non anxiogène. Jamais morbide.

Règles concrètes appliquées dans le code :

- Palette de couleurs sobres (bleu nuit, blanc, beige, gris doux, vert
  sauge) — le rouge et l'orange sont **réservés** aux alertes et
  avertissements réels (`packages/design-system/src/tokens.ts`).
- Aucune imagerie ou vocabulaire brutal dans les libellés d'interface.
- États vides toujours actionnables et rassurants
  (`EmptyState` du design system), jamais un simple « Aucune donnée ».
- Confirmation systématique avant toute action destructrice.
- Explications courtes avant toute action sensible (ex: activation d'un
  accès après décès).

## Publics cibles

1. Particuliers vivants qui préparent leurs informations (`LIVING_USER`).
2. Familles qui gèrent les démarches après un décès (`FAMILY_MEMBER`,
   `TRUSTED_PERSON`, `GUEST_LIMITED`).
3. Pompes funèbres qui accompagnent leurs clients
   (`FUNERAL_HOME_ADMIN`, `FUNERAL_ADVISOR`).
4. Plus tard (Phase 3-4) : maisons de repos, notaires, assureurs, communes,
   associations, services sociaux.

## Formalités administratives — point d'attention critique

La checklist belge par défaut (`database/seed/seed.ts`,
`BELGIAN_DEFAULT_CHECKLIST`) et les guides du site public liés aux
formalités (`apps/website/lib/content/guides.ts`, champ
`requiresOfficialVerification: true`) sont des **contenus de départ**, pas
des sources faisant foi. Avant toute mise en production :

1. Faire vérifier chaque étape par une source officielle (SPF Intérieur,
   commune, notaire.be) ou un professionnel du secteur funéraire.
2. Dater et versionner cette vérification (les formalités évoluent).
3. Prévoir un processus de mise à jour récurrent (les délais et documents
   requis peuvent changer réglementairement).

## Rôles utilisateurs

| Rôle | Description |
| --- | --- |
| `SUPER_ADMIN` | Gère toute la plateforme |
| `FUNERAL_HOME_ADMIN` | Gère une entreprise de pompes funèbres |
| `FUNERAL_ADVISOR` | Accompagne les familles au sein d'une pompe funèbre |
| `LIVING_USER` | Prépare son dossier personnel de son vivant |
| `TRUSTED_PERSON` | Personne de confiance désignée |
| `FAMILY_MEMBER` | Proche invité après décès |
| `GUEST_LIMITED` | Accès temporaire limité à certains documents ou tâches |

Labels et descriptions français centralisés dans
`packages/shared/src/enums/roles.ts` — à réutiliser dans toute nouvelle UI
plutôt que de retraduire les rôles localement.

## Tarification (positionnement, pas de facturation implémentée)

- **Gratuit** — particuliers, dossier vivant de base.
- **Plus** — particuliers, patrimoine/assurances/abonnements, stockage
  étendu.
- **Pro** — pompes funèbres, dossiers décès illimités, portail
  collaborateurs, statistiques.
- **Marque blanche** — Phase 3.

Le paiement et la facturation ne sont pas implémentés dans ce MVP (voir
`roadmap.md`, Phase 3).
