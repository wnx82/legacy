# Legacy API (NestJS)

## Démarrer

```bash
pnpm install
pnpm db:generate
pnpm --filter @legacy/api dev
```

Swagger disponible sur `http://localhost:3001/api/docs` une fois l'API démarrée.

## Organisation des modules

```
src/
├── common/           guards (JWT, rôles), decorators, filtres d'exception
├── config/           validation des variables d'environnement (Zod)
├── prisma/           service Prisma partagé (module global)
└── modules/
    ├── auth/                 stratégie JWT Keycloak, GET /auth/me
    ├── organizations/        pompes funèbres, collaborateurs, paramètres
    ├── living-profile/       dossier vivant (volontés, contacts, personnes de confiance)
    ├── death-cases/          dossier décès, checklist, famille, notes
    ├── documents/            upload/download signés (MinIO), métadonnées
    ├── checklist-templates/  modèles de checklist réutilisables
    ├── notifications/        notifications utilisateur
    ├── exports/              exports PDF/ZIP asynchrones (BullMQ)
    ├── audit-logs/           journal d'audit (module global)
    ├── stats/                statistiques d'usage (portail pro + plateforme)
    ├── site/                 formulaires publics (contact, demande de démo)
    ├── storage/              client MinIO (module global)
    ├── mailer/               envoi d'e-mails SMTP (module global)
    └── queue/                files BullMQ + processors (PDF, ZIP, e-mails)
```

## Choix documentés

- **Validation par Zod (`nestjs-zod`)** plutôt que class-validator seul : les
  DTO viennent de `@legacy/shared`, garantissant une seule source de vérité
  entre l'API et les formulaires front (Next.js).
- **Authentification par JWT Keycloak vérifié via JWKS** (`jwks-rsa` +
  `passport-jwt`) plutôt qu'une librairie d'intégration Keycloak tierce :
  moins de dépendances, contrôle total sur le mapping rôles/organisation,
  et compatible avec n'importe quel client OpenID Connect (web, Flutter).
- **Garde globale (`APP_GUARD`)** : toute route est protégée par défaut ; le
  décorateur `@Public()` doit être utilisé explicitement pour les routes
  ouvertes (`/health`, `/contact`, `/demo-request`). Principe du moindre
  privilège (voir `docs/security.md`).
- **`RolesGuard`** vérifie les rôles réalm Keycloak présents dans le token —
  aucune route sensible n'est accessible sans rôle explicite déclaré via
  `@Roles(...)`.
- **Upload direct vers MinIO** via URL PUT signée : le fichier ne transite
  jamais par l'API. L'enregistrement `Document` est créé de façon optimiste
  à la demande d'URL (voir `documents.service.ts`) ; une réconciliation
  (nettoyage des documents jamais uploadés) est prévue en Phase 2.
- **Téléchargements toujours via URL signée temporaire** (5 minutes par
  défaut, `DOWNLOAD_TOKEN_TTL_SECONDS`), jamais d'URL permanente vers MinIO.
- **Exports PDF/ZIP asynchrones (BullMQ/Redis)** : les endpoints renvoient
  immédiatement un `ExportJob` en statut `PENDING`, le client interroge
  `GET /exports/:id` pour suivre l'avancement. La génération réelle
  (rendu HTML→PDF, archive ZIP) est un stub à compléter en Phase 1
  (voir `docs/roadmap.md`).
- **Statistiques applicatives (`/stats`)** distinctes des statistiques
  d'audience du site public : ce module interroge PostgreSQL pour des KPIs
  métier (dossiers par statut, tâches en retard, score de préparation moyen),
  tandis qu'Umami (voir `infra/`) mesure le trafic web sans données
  personnelles.
- **Gestion d'erreurs sans fuite d'information** : `AllExceptionsFilter`
  masque les détails internes (stack trace) en production.
