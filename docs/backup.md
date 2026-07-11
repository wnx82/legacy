# Sauvegardes et restauration

Legacy héberge des données personnelles sensibles : une stratégie de sauvegarde
chiffrée et une procédure de restauration testée sont indispensables avant toute
mise en production.

## Ce qui est sauvegardé

| Élément | Contenu | Outil |
| --- | --- | --- |
| PostgreSQL | Bases `legacy`, `keycloak`, `umami` (dumps SQL) | `pg_dump` |
| MinIO | Objets du bucket documents | `mc mirror` |

Le tout est regroupé dans une archive `tar.gz` **chiffrée AES-256** (openssl,
PBKDF2, 200 000 itérations). Aucune donnée en clair n'est écrite sur le disque de
destination.

## Scripts

- [`infra/scripts/backup.sh`](../infra/scripts/backup.sh) — crée une sauvegarde
  chiffrée horodatée et applique la rétention.
- [`infra/scripts/restore.sh`](../infra/scripts/restore.sh) — déchiffre et
  restaure une sauvegarde (**opération destructive** sur la cible).

## Variable requise

La clé de chiffrement provient de l'environnement, **jamais du dépôt** :

```bash
export BACKUP_ENCRYPTION_KEY="<phrase secrète longue et aléatoire>"
```

Conservez cette clé dans le coffre-fort de secrets de la plateforme (ou un
gestionnaire de mots de passe hors ligne). **Sans elle, aucune restauration
n'est possible** — traitez-la comme les données elles-mêmes.

## Créer une sauvegarde

```bash
BACKUP_ENCRYPTION_KEY="..." \
BACKUP_DIR=/var/backups/legacy \
RETENTION_DAYS=14 \
MINIO_SECRET_KEY="..." \
  infra/scripts/backup.sh
```

Variables surchargeables : `POSTGRES_CONTAINER`, `POSTGRES_USER`,
`POSTGRES_DBS`, `MINIO_CONTAINER`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`,
`MINIO_SECRET_KEY`, `MINIO_BUCKET`, `BACKUP_DIR`, `RETENTION_DAYS`,
`SKIP_MINIO=1` (ignorer MinIO).

## Automatisation (cron)

Exemple : sauvegarde quotidienne à 3 h 15, journal dédié.

```cron
15 3 * * * BACKUP_ENCRYPTION_KEY="..." MINIO_SECRET_KEY="..." \
  /opt/legacy/infra/scripts/backup.sh >> /var/log/legacy-backup.log 2>&1
```

Bonnes pratiques :

- Répliquez les archives chiffrées vers un stockage **hors site** (objet
  distant, autre datacenter) — la sauvegarde locale ne protège pas d'un
  sinistre matériel.
- Surveillez la réussite du job (code de sortie non nul = échec) et alertez.
- **Testez régulièrement la restauration** sur un environnement isolé : une
  sauvegarde jamais restaurée n'est pas une sauvegarde.

## Restaurer

```bash
BACKUP_ENCRYPTION_KEY="..." \
RESTORE_MINIO=1 \
MINIO_SECRET_KEY="..." \
  infra/scripts/restore.sh /var/backups/legacy/legacy-backup-YYYYMMDD-HHMMSS.tar.gz.enc
```

Par défaut la restauration ne touche que PostgreSQL ; passez `RESTORE_MINIO=1`
pour restaurer aussi les objets MinIO.

## Vérification effectuée

Le chemin PostgreSQL (dump → chiffrement → déchiffrement) a été testé de bout
en bout contre le conteneur `legacy-postgres` : l'archive est bien illisible
sans la clé et le dump restauré contient les instructions SQL attendues. Le
miroir MinIO utilise `mc mirror` (non exécuté dans l'environnement de
développement dépourvu d'objets, mais commande standard et documentée).

## Rotation des secrets liés

En cas de compromission suspectée, voir la procédure de rotation des secrets
dans [`docs/deployment.md`](deployment.md) : la clé de sauvegarde doit être
renouvelée et les anciennes archives (chiffrées avec l'ancienne clé) conservées
séparément jusqu'à expiration de leur durée de rétention.
