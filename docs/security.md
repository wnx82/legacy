# Sécurité

Legacy traite des données personnelles sensibles (santé, patrimoine,
volontés, informations familiales). La sécurité est traitée comme une
exigence de premier ordre, pas comme une option.

## Authentification et autorisation

- **Keycloak** comme unique fournisseur d'identité : mots de passe jamais
  gérés par les applications elles-mêmes.
- **2FA obligatoire pour les rôles professionnels** (`SUPER_ADMIN`,
  `FUNERAL_HOME_ADMIN`, `FUNERAL_ADVISOR`) — configuré au niveau du realm
  Keycloak (`requiredActions` dans `infra/keycloak/realm-export.json`).
- **JWT vérifiés par JWKS** (`api/src/modules/auth/strategies/keycloak.strategy.ts`),
  jamais par un simple décodage non vérifié.
- **Garde de rôles globale** (`RolesGuard`) : toute route protégée doit
  déclarer explicitement les rôles autorisés via `@Roles(...)` — principe du
  moindre privilège. Les routes publiques doivent explicitement porter
  `@Public()`.
- **Séparation stricte des organisations** : toutes les requêtes scoping
  par `organizationId` sont vérifiées côté service (voir
  `organizations.service.ts`, `death-cases.service.ts`).
- **RBAC à deux niveaux :**
  1. **Rôles plateforme** (7 rôles de base) : appliqués partout et faisant
     autorité pour les décisions d'accès (`@Roles`, `assertCanAccessDeathCase`,
     `assertCanManage` sur les `AccessGrant`).
  2. **Permissions fines** (`Role`/`Permission` par organisation) : le
     **catalogue de 12 permissions est désormais alimenté au seed**
     (`death_case.read`, `document.download`, `export.create`, …) et prêt à
     être associé à des rôles personnalisés. **Périmètre assumé** : l'interface
     de composition de rôles personnalisés côté produit reste un chantier
     ultérieur ; les décisions d'accès sensibles restent portées par les rôles
     plateforme (refus par défaut), ce qui ne dépend pas de la gestion fine.

## Documents

- **Chiffrement en transit** (TLS recommandé en production — voir
  `deployment.md`) et **au repos** (chiffrement serveur MinIO à activer en
  production).
- **URLs signées et temporaires** pour l'upload (`getPresignedUploadUrl`) et
  le téléchargement (`getPresignedDownloadUrl`), jamais d'URL permanente.
- **Aucun fichier ne transite par l'API** : upload/download directs entre
  le client et MinIO.
- **Journalisation systématique** des téléchargements de documents
  (`AuditLog`, action `document.download`).
- **Suppression logique puis physique** : `Document.deletedAt` est posé
  immédiatement, la suppression réelle de l'objet MinIO est déclenchée dans
  le même appel (`DocumentsService.remove`).
- **Vérification post-upload** (`POST /documents/:id/confirm`) : recalcul du
  **checksum SHA-256 réel** de l'objet (remplace le placeholder posé à la
  création) et **scan antivirus** via clamd (`AntivirusService`, protocole
  INSTREAM). Statut porté par `Document.scanStatus`
  (`PENDING`/`CLEAN`/`INFECTED`/`SKIPPED`). Un fichier détecté infecté est
  **purgé de MinIO et neutralisé** (soft delete). Si `CLAMAV_HOST` n'est pas
  configuré, le scan est `SKIPPED` (jamais un faux `CLEAN`), mais le checksum
  est tout de même recalculé. Le type MIME et la taille sont déjà validés en
  amont (`ALLOWED_DOCUMENT_MIME_TYPES`, taille max) via Zod.

## Accès après décès

Le module `AccessGrant` (voir `database/prisma/schema.prisma`) modélise un
processus prudent et non automatique :

- Statuts explicites (`PENDING`, `ACTIVE`, `SUSPENDED`, `REVOKED`, `EXPIRED`).
- Traçabilité de qui a accordé, validé ou révoqué un accès
  (`grantedByUserId`, `validatedByUserId`).
- Portée limitée par catégorie de données (`allowedCategories`), jamais un
  accès total par défaut.
- Expiration possible (`expiresAt`).

Les endpoints et workflows sont désormais en place (`access-grants`):
demande (`POST /access-grants`), activation, suspension, révocation, liste
des accès d'un dossier vivant et liste des accès actifs du bénéficiaire.
Chaque transition sensible est journalisée et les activations déclenchent une
notification.

## Audit

Toutes les actions sensibles listées dans le cahier des charges (connexion,
échec de connexion, consultation/téléchargement de document, création/
modification de dossier, invitation, suppression, export, changement de
rôle) doivent passer par `AuditLogsService.log()`. Un échec de journalisation
n'interrompt jamais l'action métier (voir le commentaire dans
`audit-logs.service.ts`), mais est lui-même journalisé côté serveur.

## Sécurité applicative (API)

- **Helmet durci** (`main.ts`) : CSP stricte (`default-src 'none'`,
  `frame-ancestors 'none'`, `base-uri 'none'` — l'API ne sert que du JSON),
  `HSTS` activé en production (1 an, `includeSubDomains`, `preload`),
  `Referrer-Policy: no-referrer`, `Cross-Origin-Resource-Policy: same-site`,
  suppression de `X-Powered-By`.
- **`trust proxy` = 1** : vraie IP client derrière le reverse proxy (rate
  limiting et audit fiables).
- **Limite de taille des corps de requête** (256 Ko JSON) : l'API ne reçoit
  que des métadonnées, les fichiers vont directement en MinIO via URL signée.
- **CORS restreint** aux seules origines connues (`WEBSITE_URL`,
  `WEB_PRO_URL`, `WEB_FAMILY_URL`).
- **Rate limiting** (`@nestjs/throttler`), configurable via
  `RATE_LIMIT_MAX`/`RATE_LIMIT_WINDOW_MS` ; **limite serrée (5/min/IP)** sur
  les formulaires publics non authentifiés (`/contact`, `/demo-request`).
- **Pot de miel anti-spam** (`website`) sur les formulaires publics : une
  soumission le remplissant reçoit un succès factice sans persistance.
- **Protection anti-IDOR sur les dossiers décès** : lecture d'un dossier, de
  sa checklist et de ses documents réservée à un professionnel ou à un proche
  disposant d'une invitation acceptée (`assertCanAccessDeathCase`).
- **Validation stricte des entrées** via Zod (`nestjs-zod`), schémas
  partagés avec les frontends (`@legacy/shared`) : type MIME et taille des
  documents contrôlés (`ALLOWED_DOCUMENT_MIME_TYPES`, taille max).
- **Pas de fuite d'information en production** : `AllExceptionsFilter`
  masque les stack traces et détails internes lorsque `APP_ENV=production`.
- **Secrets hors du code source** : toutes les valeurs sensibles viennent de
  variables d'environnement (`.env`, jamais committées).

## Ce qui reste à renforcer (Phase 2)

Voir `roadmap.md` — chiffrement applicatif renforcé des champs les plus
sensibles (ex: `nationalNumber`), rotation des secrets, montée de dépendances
majeures, et vérifications e2e complètes sur environnement intégré.
