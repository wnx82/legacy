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
  le lien envoyé par la pompe funèbre contient `?dossier=<id>`, mémorisé en
  local. Une vraie association utilisateur ↔ dossier(s) multiple est prévue
  en Phase 2 (voir `docs/roadmap.md`) une fois le flux d'invitation par
  e-mail réellement branché.
- **Navigation horizontale simple** plutôt qu'une sidebar : le public visé
  (familles en deuil, souvent peu technophiles) bénéficie d'un parcours plus
  direct et moins dense que le portail professionnel.
- **Contacts utiles et volontés partagées** : pages présentes mais en attente
  d'un endpoint API dédié pour exposer en toute sécurité les données du
  dossier vivant du défunt à la famille (voir commentaires dans le code et
  `docs/roadmap.md`).
