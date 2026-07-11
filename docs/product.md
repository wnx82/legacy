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
`requiresOfficialVerification: true`) restent des **contenus de guidage**,
pas un avis juridique se substituant à un notaire ou à la commune.

### Vérification effectuée

- **Date de vérification : 2026-07-11.**
- **Sources officielles consultées :**
  - [belgium.be — Famille > Décès > Déclaration](https://www.belgium.be/fr/famille/deces/declaration)
  - [notaire.be — Procédure après décès](https://www.notaire.be/heritage-et-donations/heritage/procedure-apres-deces)
    et [Déclaration de succession](https://www.notaire.be/heritage-et-donations/heritage/procedure-apres-deces/la-declaration-de-succession)
  - [SPF Finances — Déposer une déclaration de succession](https://fin.belgium.be/en/private-individuals/death/declaration-estate)
- **Faits datés et sourcés intégrés :** déclaration du décès au plus vite à la
  commune du lieu de décès (souvent via la pompe funèbre) ; acte de décès dressé
  par cette commune puis transmis à la commune de résidence ; **déclaration de
  succession dans les 4 mois** (décès en Belgique — 5 mois ailleurs en Europe,
  6 mois hors Europe) ; **paiement des droits de succession dans les 6 mois**
  (décès en Belgique). Chaque item de la checklist porte désormais une
  `description` rappelant l'autorité compétente et, le cas échéant, le délai.

### À maintenir

1. Les délais cités valent pour un décès **survenu en Belgique** ; confirmer les
   variantes régionales/communales avec la commune ou un professionnel.
2. **Redater** cette vérification à chaque révision (les formalités évoluent).
3. Prévoir un processus de mise à jour récurrent (délais et documents requis
   peuvent changer réglementairement).

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
