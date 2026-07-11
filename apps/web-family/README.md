# Legacy — Espace famille (web-family)

Espace web pour les proches invités à suivre un dossier décès.

## Démarrer

```bash
cp .env.local.example .env.local
pnpm --filter @legacy/web-family dev
```

## Choix documentés

- **Authentification Keycloak obligatoire** (`lib/auth.tsx`), comme le
  portail professionnel — un proche doit créer un compte (ou se connecter)
  pour accéder à un dossier, ce qui permet la traçabilité des accès exigée
  par `docs/security.md`.
- **Sélection du dossier via lien d'invitation** (`lib/use-family-case.ts`) :
  après acceptation d'une invitation `/invitation?token=...`, l'identifiant du
  dossier décès est mémorisé localement pour simplifier les visites suivantes.
  La gestion multi-dossiers pour un même proche reste un chantier ultérieur.
- **Navigation horizontale simple** plutôt qu'une sidebar : le public visé
  (familles en deuil, souvent peu technophiles) bénéficie d'un parcours plus
  direct et moins dense que le portail professionnel.
- **Contacts utiles et volontés partagées** : pages reliées à des endpoints
  API dédiés (`GET /death-cases/:id/contacts`, `GET /death-cases/:id/wishes`)
  qui ne renvoient que les données explicitement partageables avec la famille.
