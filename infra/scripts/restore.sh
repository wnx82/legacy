#!/usr/bin/env bash
# =============================================================================
# Legacy — Restauration d'une sauvegarde chiffrée
#
# Déchiffre une archive produite par backup.sh et restaure PostgreSQL (et,
# optionnellement, les objets MinIO). Opération DESTRUCTIVE sur la cible :
# à n'exécuter qu'en connaissance de cause.
#
# Usage :
#   BACKUP_ENCRYPTION_KEY=... ./restore.sh backups/legacy-backup-YYYYMMDD-HHMMSS.tar.gz.enc
# =============================================================================
set -Eeuo pipefail

ARCHIVE="${1:-}"
if [[ -z "$ARCHIVE" || ! -f "$ARCHIVE" ]]; then
  echo "Usage : BACKUP_ENCRYPTION_KEY=... $0 <archive.tar.gz.enc>" >&2
  exit 1
fi
if [[ -z "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
  echo "ERREUR : BACKUP_ENCRYPTION_KEY n'est pas défini." >&2
  exit 1
fi

POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-legacy-postgres}"
POSTGRES_USER="${POSTGRES_USER:-legacy}"
MINIO_CONTAINER="${MINIO_CONTAINER:-legacy-minio}"
MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://minio:9000}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-legacy}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-legacy_minio_secret}"
MINIO_BUCKET="${MINIO_BUCKET:-legacy-documents}"
RESTORE_MINIO="${RESTORE_MINIO:-0}"

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

echo "==> Déchiffrement de $ARCHIVE"
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_ENCRYPTION_KEY -in "$ARCHIVE" \
  | tar -C "$WORKDIR" -xzf -

echo "==> Restauration PostgreSQL"
for sql in "$WORKDIR"/postgres/*.sql; do
  db="$(basename "$sql" .sql)"
  echo "  - restauration de $db"
  docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$db" < "$sql"
done

if [[ "$RESTORE_MINIO" == "1" && -d "$WORKDIR/minio" ]]; then
  echo "==> Restauration MinIO ($MINIO_BUCKET)"
  docker run --rm --network container:"$MINIO_CONTAINER" \
    -v "$WORKDIR/minio:/data" \
    --entrypoint sh minio/mc:latest -c "
      mc alias set dst '$MINIO_ENDPOINT' '$MINIO_ACCESS_KEY' '$MINIO_SECRET_KEY' >/dev/null &&
      mc mb --ignore-existing dst/'$MINIO_BUCKET' &&
      mc mirror --quiet --overwrite /data dst/'$MINIO_BUCKET'
    "
else
  echo "==> Restauration MinIO ignorée (RESTORE_MINIO != 1)"
fi

echo "==> Restauration terminée."
