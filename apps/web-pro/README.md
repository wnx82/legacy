# Legacy — Portail professionnel (web-pro)

Portail Next.js pour les pompes funèbres : dossiers décès, checklist,
documents, famille, collaborateurs, statistiques.

## Démarrer

```bash
pnpm --filter @legacy/web-pro dev
```

## Choix documentés

- **`keycloak-js` en mode `login-required`** (`lib/auth.tsx`) : toutes les
  pages du portail exigent une session valide, contrairement au site public.
  Le rafraîchissement de token est géré automatiquement.
- **Récupération des données côté client** (`useApiClient`, composants
  `'use client'`) plutôt que via des Route Handlers Next.js : le portail est
  un tableau de bord interactif où chaque action (changer un statut, inviter
  un proche) doit rafraîchir l'état immédiatement. Le token Keycloak est
  attaché à chaque requête vers l'API NestJS.
- **`useCurrentUser`** interroge `GET /auth/me` pour connaître l'organisation
  de l'utilisateur connecté (nécessaire pour scoper les dossiers, les
  statistiques et les paramètres).
- **Statistiques (`/statistiques`)** consomment `GET
  /organizations/:id/stats` de l'API — distinct des statistiques d'audience
  du site public (Umami).
