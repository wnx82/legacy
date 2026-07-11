#!/usr/bin/env bash
# =============================================================================
# Legacy — Sauvegarde chiffrée (PostgreSQL + objets MinIO)
#
# Produit une archive chiffrée AES-256 (openssl, PBKDF2) contenant :
#   - un dump SQL de chaque base PostgreSQL (legacy, keycloak, umami) ;
#   - un miroir des objets MinIO (bucket documents).
#
# Chiffrement : la clé provient de $BACKUP_ENCRYPTION_KEY (jamais commitée).
# Aucune donnée sensible n'est écrite en clair sur le disque de destination.
#
# Usage :
#   BACKUP_ENCRYPTION_KEY=... ./backup.sh
#
# Restauration : voir restore.sh et docs/backup.md.
# =============================================================================
set -Eeuo pipefail

# --- Configuration (surchargée par l'environnement) --------------------------
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-legacy-postgres}"
POSTGRES_USER="${POSTGRES_USER:-legacy}"
POSTGRES_DBS="${POSTGRES_DBS:-legacy keycloak umami}"

MINIO_CONTAINER="${MINIO_CONTAINER:-legacy-minio}"
MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://minio:9000}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-legacy}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-legacy_minio_secret}"
MINIO_BUCKET="${MINIO_BUCKET:-legacy-documents}"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
SKIP_MINIO="${SKIP_MINIO:-0}"

if [[ -z "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
  echo "ERREUR : BACKUP_ENCRYPTION_KEY n'est pas défini. Abandon (pas de sauvegarde en clair)." >&2
  exit 1
fi

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

mkdir -p "$BACKUP_DIR"
echo "==> Sauvegarde Legacy $TIMESTAMP"

# --- 1. Dumps PostgreSQL -----------------------------------------------------
mkdir -p "$WORKDIR/postgres"
for db in $POSTGRES_DBS; do
  echo "  - pg_dump $db"
  docker exec "$POSTGRES_CONTAINER" pg_dump -U "$POSTGRES_USER" -d "$db" --no-owner --clean --if-exists \
    > "$WORKDIR/postgres/$db.sql"
done

# --- 2. Miroir des objets MinIO ---------------------------------------------
if [[ "$SKIP_MINIO" != "1" ]]; then
  echo "  - miroir MinIO ($MINIO_BUCKET)"
  mkdir -p "$WORKDIR/minio"
  # Utilise le client mc dans une image jetable, réseau du conteneur MinIO.
  docker run --rm --network container:"$MINIO_CONTAINER" \
    -v "$WORKDIR/minio:/data" \
    --entrypoint sh minio/mc:latest -c "
      mc alias set src '$MINIO_ENDPOINT' '$MINIO_ACCESS_KEY' '$MINIO_SECRET_KEY' >/dev/null &&
      mc mirror --quiet --overwrite src/'$MINIO_BUCKET' /data || true
    "
else
  echo "  - miroir MinIO ignoré (SKIP_MINIO=1)"
fi

# --- 3. Archive + chiffrement ------------------------------------------------
ARCHIVE="$BACKUP_DIR/legacy-backup-$TIMESTAMP.tar.gz.enc"
echo "  - archivage et chiffrement AES-256"
tar -C "$WORKDIR" -czf - . \
  | openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:BACKUP_ENCRYPTION_KEY \
  > "$ARCHIVE"
chmod 600 "$ARCHIVE"

# --- 4. Rétention ------------------------------------------------------------
echo "  - purge des sauvegardes de plus de $RETENTION_DAYS jours"
find "$BACKUP_DIR" -name 'legacy-backup-*.tar.gz.enc' -type f -mtime +"$RETENTION_DAYS" -delete

echo "==> Terminé : $ARCHIVE ($(du -h "$ARCHIVE" | cut -f1))"
