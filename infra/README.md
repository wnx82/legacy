# Infra — environnement local

`docker-compose.yml` démarre l'ensemble des services nécessaires au
développement local de Legacy.

## Services et ports

| Service    | Rôle                                          | Port hôte             |
| ---------- | ---------------------------------------------- | ---------------------- |
| postgres   | Base de données (legacy, keycloak, umami)      | 5432                    |
| redis      | File de jobs BullMQ                            | 6379                    |
| minio      | Stockage documentaire compatible S3            | 9000 (API) / 9001 (UI)  |
| keycloak   | Authentification, rôles, 2FA                   | 8080                    |
| umami      | Statistiques d'audience (site public)          | 8081                    |
| mailhog    | Boîte mail de test (SMTP)                      | 1025 (SMTP) / 8025 (UI) |
| adminer    | Administration PostgreSQL (dev uniquement)     | 8082                    |
| api        | API NestJS                                     | 3001                    |

## Choix documentés

- **Une seule instance PostgreSQL, plusieurs bases logiques** (`legacy`,
  `keycloak`, `umami`) plutôt que trois conteneurs PostgreSQL séparés : plus
  simple à lancer en local, tout en gardant une isolation par base de
  données. En production, ce choix peut être reconsidéré (instances
  managées séparées) — voir `docs/deployment.md`.
- **Umami plutôt que Google Analytics** pour les statistiques du site
  public et des portails : auto-hébergeable, ne dépose pas de cookies,
  ne collecte pas de données personnelles identifiables, conforme RGPD
  par défaut. Voir `docs/rgpd.md`.
- **Mailhog** intercepte tous les e-mails en développement : aucun e-mail
  réel n'est jamais envoyé en local.
- **Keycloak `start-dev --import-realm`** importe automatiquement le realm
  `legacy` (rôles, clients OpenID Connect, utilisateur admin de test) au
  démarrage. Ce mode n'est pas destiné à la production — voir
  `docs/deployment.md`.

## Identifiants de test (développement uniquement)

- Keycloak admin console (`/admin`) : `admin` / `change_me_keycloak_admin`
  (valeur définie par `KEYCLOAK_ADMIN_PASSWORD` dans `.env`).
- Utilisateur applicatif de test : `admin@legacy.local` / `ChangeMe123!`
  (mot de passe temporaire, à changer à la première connexion).
- MinIO console (`http://localhost:9001`) : voir `MINIO_ACCESS_KEY` /
  `MINIO_SECRET_KEY` dans `.env`.

Ces identifiants ne doivent jamais être utilisés tels quels en production.
