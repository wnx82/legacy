# Audit final — Legacy

- **Date :** 2026-07-11 (fuseau Europe/Brussels)
- **Branche d'audit :** `audit/final-application-review`
- **Version cible :** 1.1.0
- **Périmètre :** monorepo complet (API NestJS, sites Next.js `website` /
  `web-pro` / `web-family`, app Flutter, base Prisma, infra Docker).

Cet audit conclut une campagne de finalisation menée par étapes fonctionnelles
(une branche par étape, fusionnée dans `main`). Il reprend l'état réel du code
au terme de ces travaux et n'attribue le statut « Corrigé » qu'après
vérification.

## 1. Méthode de vérification

| Vérification | Commande | Résultat |
| --- | --- | --- |
| Types | `pnpm typecheck` | ✅ 7/7 packages |
| Lint | `pnpm lint` | ✅ 5/5 packages |
| Tests | `pnpm test` | ✅ 23 tests (20 API + 3 shared) |
| Build production | `pnpm build` | ✅ 5/5 packages |
| Migrations | `prisma migrate status` | ✅ 2 migrations, base à jour |
| Démarrage API réel | `node dist/main.js` + `curl` | ✅ boot, `/health`, `/api/docs` |
| Contrôle d'accès | `curl` route protégée sans token | ✅ `401` |
| Anti-spam | `curl` formulaire + pot de miel | ✅ succès factice, non persisté |
| En-têtes | `curl -D -` | ✅ CSP stricte, `Referrer-Policy`, pas de `X-Powered-By` |
| Sauvegarde chiffrée | `backup.sh` + round-trip openssl | ✅ archive illisible sans clé, dump valide |
| Seed | `pnpm db:seed` | ✅ catégories, checklist datée, 12 permissions |

Environnement d'intervention : PostgreSQL, Redis et l'API ont été exécutés
réellement. **MinIO** n'a pu être démarré (port 9000 déjà occupé sur l'hôte) ;
les chemins MinIO sont couverts par le typage/build et les tests unitaires mais
n'ont pas été exercés à chaud. L'**app Flutter** n'a pas pu être compilée (SDK
absent). **Keycloak** n'a pas été démarré ; l'échange de token réel n'a donc pas
été rejoué de bout en bout.

## 2. Tableau des constats

| ID | Domaine | Constat | Sévérité | Risque | Correction | Statut | Branche/commit |
| -- | ------- | ------- | -------- | ------ | ---------- | ------ | -------------- |
| F-01 | Fonctionnel | Exports PDF/ZIP = placeholders (aucun fichier produit) | Élevée | Fonction annoncée non opérante | Rendu réel pdfkit + archiver, upload MinIO, statut job, endpoint de téléchargement signé | Corrigé | `feat/exports-rendering` |
| F-02 | Fonctionnel | Invitation famille sans e-mail ; lien `?dossier=<id>` manuel | Élevée | Parcours famille inutilisable en autonomie | E-mail via file + jeton fort + endpoints resolve/accept + page `/invitation` | Corrigé | `feat/family-invitations-email` |
| F-03 | Fonctionnel | Contacts/volontés du défunt non exposés à la famille | Moyenne | Valeur produit manquante | Endpoints `/contacts` et `/wishes` + pages reliées | Corrigé | `feat/family-data-sharing` |
| F-04 | Fonctionnel | `AccessGrant` modélisé mais sans workflow | Élevée | Accès après décès impossible | Module complet demande/activation/suspension/révocation + notif + audit | Corrigé | `feat/access-grants` |
| F-05 | Conformité | Export RGPD et suppression de compte absents | Élevée | Non-conformité RGPD (portabilité, effacement) | `POST /exports/rgpd` + `DELETE /accounts/me` (cascade + purge MinIO + anonymisation) | Corrigé | `feat/rgpd-and-account-deletion` |
| S-01 | Sécurité | IDOR : tout utilisateur authentifié pouvait lire n'importe quel dossier décès | Élevée | Fuite de données entre familles | `assertCanAccessDeathCase` sur lecture dossier/checklist/documents ; `/family` réservé pro | Corrigé | `security/hardening` |
| S-02 | Sécurité | En-têtes HTTP par défaut (helmet minimal, pas de CSP/HSTS) | Moyenne | Surface XSS/clickjacking, HTTPS non épinglé | CSP stricte, HSTS (prod), Referrer-Policy, CORP, suppression X-Powered-By, trust proxy, limite de corps | Corrigé | `security/hardening` |
| S-03 | Sécurité | Formulaires publics sans anti-spam ni limite serrée | Moyenne | Spam / abus | Pot de miel + rate limit 5/min/IP (vérifié à chaud) | Corrigé | `security/hardening` |
| S-04 | Sécurité | Documents uploadés non scannés ; checksum = placeholder aléatoire | Élevée | Malware stocké, intégrité non vérifiée | `POST /documents/:id/confirm` → SHA-256 réel + scan clamd (INSTREAM), purge si infecté | Corrigé | `feat/document-antivirus-scan` |
| S-05 | Sécurité | `nodemailer` 6 vulnérable (domaine non intentionnel) | Moyenne | Envoi e-mail détourné | Montée en 7.x, re-vérifiée | Corrigé | `security/dependency-updates` |
| S-06 | Sécurité | Vulnérabilités transitives + Next.js 14 (avis DoS, patché en 15) | Moyenne | Montée majeure requise | Bump majeur reporté (regression testing dédié) ; mitigations prod (reverse proxy, rate limit) | Accepté | — |
| O-01 | Exploitation | Pas de sauvegarde chiffrée automatisée | Élevée | Perte de données irréversible | `backup.sh`/`restore.sh` AES-256 + `docs/backup.md` (cron, hors-site, rotation) | Corrigé | `ops/backups` |
| O-02 | Exploitation | Pas de tableau de bord d'audit ; couverture partielle | Moyenne | Traçabilité incomplète | `GET /audit-logs/summary` + page « Journal d'audit » pro + logs élargis | Corrigé | `feat/audit-coverage` |
| Q-01 | Qualité | Gate `pnpm lint` cassé (API sans ESLint, apps Next sans config) | Moyenne | CI non fiable | ESLint configuré partout, `pnpm lint` vert | Corrigé | `chore/tooling-lint` |
| Q-02 | Qualité | Démarrage API cassé (`express` non déclaré) après durcissement | Élevée | Service indémarrable en prod | `express` en dépendance directe, boot re-vérifié | Corrigé | `fix/express-dependency` |
| C-01 | Contenu | Formalités belges non vérifiées/datées | Moyenne | Information erronée aux familles | Vérifiées 2026-07-11 (belgium.be, notaire.be, SPF Finances), délais légaux + sources | Corrigé | `docs/formalities-verification` |
| A-01 | App | Auth OIDC desktop Flutter non implémentée | Moyenne | App desktop inutilisable | Flux loopback PKCE (RFC 8252) implémenté | Corrigé (exécution non vérifiée) | `feat/flutter-desktop-oidc` |
| R-01 | RBAC | Permissions fines modélisées mais catalogue vide, pas d'UI | Faible | Gestion fine non exploitable | Catalogue (12 permissions) semé ; UI de composition = périmètre ultérieur documenté | Accepté | `refactor/rbac-permission-catalog` |
| V-01 | Vérification | MinIO/Keycloak/Flutter non exercés à chaud dans l'env d'audit | Information | Couverture d'intégration partielle | Chemins typés/testés unitairement ; à rejouer sur env complet | Bloqué par une dépendance externe | — |

## 3. Détail par domaine

### 3.1 Fonctionnel

Tous les parcours listés dans `todo.md` sont désormais opérationnels au niveau
code et API : exports réels, invitations famille par e-mail, partage
contacts/volontés, accès après décès, RGPD (export + suppression). Les parcours
publics (formulaires) ont été testés à chaud. Limite restante : les parcours
nécessitant Keycloak (connexion réelle) et MinIO (upload/download réel) n'ont
pas été rejoués de bout en bout dans l'environnement d'audit.

### 3.2 Sécurité

Authentification Keycloak/JWKS (RS256, `iss` vérifié), gardes globales
(JWT + rôles + throttler), refus par défaut. Ajouts : anti-IDOR sur les
dossiers décès, en-têtes durcis (vérifiés à chaud), anti-spam formulaires
(vérifié à chaud), scan antivirus + checksum réel des documents, contrôle de
propriété sur les exports. Secrets hors dépôt (`.env` ignoré, `.env.example`
sans secret réel). Aucun secret réel introduit par l'intervention.

### 3.3 Technique / architecture

Monorepo pnpm + turbo cohérent, séparation claire des modules NestJS, DTO Zod
partagés (`@legacy/shared`), gardes/filtres transverses. Lint désormais
opérationnel. Dette résiduelle mesurée : montée majeure Next.js 14→15 et
quelques dépendances transitives (statut « Accepté »).

### 3.4 Performance

Uploads/downloads directs client↔MinIO (l'API ne transporte pas les fichiers) ;
exports asynchrones via files BullMQ ; ZIP en streaming ; index Prisma présents
sur les clés d'accès fréquentes. Pas de régression introduite. Optimisations
fines (cache HTTP, pagination généralisée) non prioritaires à ce stade.

### 3.5 UX / accessibilité / responsive

États de chargement/vide/erreur ajoutés aux nouvelles pages famille et au
journal d'audit ; tableaux `overflow-x` pour le mobile ; contenu francophone.
Audit lecteur d'écran non rejoué automatiquement (non vérifié).

### 3.6 Production

Sauvegarde/restauration chiffrées documentées et testées (chemin PostgreSQL) ;
healthcheck `/health` opérationnel ; journal d'audit ; variables sensibles
externalisées. Déploiement réel non effectué dans cet environnement (voir
section 5).

## 4. Scores

Pondération appliquée : Fonctionnalités 25 %, Sécurité 25 %, Qualité 15 %,
Tests 15 %, Performance 7,5 %, Accessibilité 5 %, Documentation 5 %,
Production 2,5 %.

| Domaine | Score /100 | Justification |
| --- | --- | --- |
| Fonctionnalités | 88 | Tous les items `todo.md` livrés et vérifiés au niveau API ; parcours Keycloak/MinIO non rejoués de bout en bout. |
| Sécurité | 85 | Durcissement large et vérifié (IDOR, en-têtes, anti-spam, antivirus, RGPD) ; montée majeure Next.js en attente. |
| Qualité du code | 82 | Lint opérationnel, architecture propre, DTO partagés ; dette majeure de dépendances restante. |
| Tests | 72 | 23 tests unitaires ciblés (sécurité, RGPD, exports, antivirus) + smoke test API réel ; peu d'e2e/intégration automatisés. |
| Performance | 78 | Uploads directs, exports async/streaming, index présents ; pas de mesure avant/après formelle. |
| Accessibilité | 70 | États UI et responsive soignés ; pas d'audit lecteur d'écran automatisé. |
| Documentation | 90 | README, CHANGELOG horodaté, docs sécurité/RGPD/backup/product à jour, cet audit. |
| Production | 68 | Sauvegarde/restauration + healthcheck + audit ; déploiement réel non effectué ici. |

**Score global pondéré :**
`0.25×88 + 0.25×85 + 0.15×82 + 0.15×72 + 0.075×78 + 0.05×70 + 0.05×90 + 0.025×68`
= `22.0 + 21.25 + 12.30 + 10.80 + 5.85 + 3.50 + 4.50 + 1.70`
= **81.9 / 100**.

## 5. Éléments restant à faire (blocages externes / non vérifiables ici)

- **Déploiement production** : nécessite les accès à la plateforme cible (DNS,
  reverse proxy, TLS, secrets). Non fournis dans l'environnement d'intervention.
- **Rejeu e2e Keycloak + MinIO** : nécessite la stack Docker complète (MinIO
  bloqué par un conflit de port local ; Keycloak non démarré). Les chemins sont
  typés/testés unitairement.
- **Exécution de l'app Flutter** : SDK Flutter absent — le flux desktop OIDC est
  écrit et conforme au standard mais reste à exécuter sur une machine équipée.
- **Montée majeure Next.js 14 → 15** et purge des vulnérabilités transitives :
  à planifier avec une campagne de tests de non-régression dédiée.
- **Rotation des identifiants de démonstration** (`admin@legacy.local`) et
  configuration d'un SMTP réel : à réaliser lors de la mise en production
  (voir `docs/deployment.md`).
