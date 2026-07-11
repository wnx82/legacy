#!/usr/bin/env node
/**
 * Migration idempotente des médias/objets d'un stockage S3 source (MinIO local)
 * vers un stockage S3 destination (Garage partagé).
 *
 * Propriétés :
 *   - IDEMPOTENT : un objet déjà présent (même taille) dans la destination est ignoré.
 *   - REPRISE    : un manifeste JSONL enregistre chaque clé migrée ; relancer le
 *                  script reprend là où il s'est arrêté.
 *   - DRY-RUN    : --dry-run n'écrit rien, produit seulement l'inventaire.
 *   - SANS SECRET dans les logs : seules des clés d'objets et des tailles sont affichées.
 *   - NE SUPPRIME JAMAIS la source.
 *
 * Exécution (depuis le paquet api pour résoudre le client `minio`) :
 *   pnpm --filter @legacy/api migrate:media -- --dry-run
 *   pnpm --filter @legacy/api migrate:media
 *
 * Configuration par variables d'environnement (aucune valeur en dur) :
 *   Source :  SRC_S3_ENDPOINT SRC_S3_ACCESS_KEY_ID SRC_S3_SECRET_ACCESS_KEY
 *             SRC_S3_BUCKET [SRC_S3_REGION]
 *             — à défaut, repli sur MINIO_ENDPOINT/MINIO_PORT/MINIO_USE_SSL/
 *               MINIO_ACCESS_KEY/MINIO_SECRET_KEY/MINIO_BUCKET
 *   Dest.  :  S3_ENDPOINT S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY S3_BUCKET [S3_REGION]
 *   Divers :  MIGRATION_PREFIX (limiter à un préfixe), MIGRATION_MANIFEST (chemin)
 */
import { Client as MinioClient } from 'minio';
import { existsSync, readFileSync, appendFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DRY_RUN = process.argv.includes('--dry-run');
const PREFIX = process.env.MIGRATION_PREFIX ?? '';
const MANIFEST = resolve(process.env.MIGRATION_MANIFEST ?? './media-migration.manifest.jsonl');

function required(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`[migrate] Variable manquante : ${name}`);
    process.exit(2);
  }
  return v;
}

/** Construit un client à partir d'un endpoint URL (http(s)://host:port). */
function clientFromEndpoint(endpoint, accessKey, secretKey, region) {
  const url = new URL(endpoint);
  const useSSL = url.protocol === 'https:';
  return new MinioClient({
    endPoint: url.hostname,
    port: url.port ? Number(url.port) : useSSL ? 443 : 80,
    useSSL,
    accessKey,
    secretKey,
    region: region ?? 'us-east-1',
    pathStyle: true,
  });
}

function buildSourceClient() {
  if (process.env.SRC_S3_ENDPOINT) {
    return {
      client: clientFromEndpoint(
        required('SRC_S3_ENDPOINT'),
        required('SRC_S3_ACCESS_KEY_ID'),
        required('SRC_S3_SECRET_ACCESS_KEY'),
        process.env.SRC_S3_REGION,
      ),
      bucket: required('SRC_S3_BUCKET'),
    };
  }
  // Repli sur le schéma MINIO_* (dev local).
  return {
    client: new MinioClient({
      endPoint: required('MINIO_ENDPOINT'),
      port: Number(process.env.MINIO_PORT ?? 9000),
      useSSL: String(process.env.MINIO_USE_SSL) === 'true',
      accessKey: required('MINIO_ACCESS_KEY'),
      secretKey: required('MINIO_SECRET_KEY'),
      region: process.env.MINIO_REGION ?? 'us-east-1',
      pathStyle: true,
    }),
    bucket: required('MINIO_BUCKET'),
  };
}

function buildDestClient() {
  return {
    client: clientFromEndpoint(
      required('S3_ENDPOINT'),
      required('S3_ACCESS_KEY_ID'),
      required('S3_SECRET_ACCESS_KEY'),
      process.env.S3_REGION ?? 'garage',
    ),
    bucket: required('S3_BUCKET'),
  };
}

function loadDoneSet() {
  const done = new Set();
  if (existsSync(MANIFEST)) {
    for (const line of readFileSync(MANIFEST, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try {
        const rec = JSON.parse(line);
        if (rec.key && rec.status === 'ok') done.add(rec.key);
      } catch {
        // ligne corrompue ignorée
      }
    }
  }
  return done;
}

function listObjects(client, bucket, prefix) {
  return new Promise((resolvePromise, reject) => {
    const objects = [];
    const stream = client.listObjectsV2(bucket, prefix, true);
    stream.on('data', (obj) => obj.name && objects.push({ key: obj.name, size: obj.size }));
    stream.on('error', reject);
    stream.on('end', () => resolvePromise(objects));
  });
}

async function destHasSameSize(dest, key, size) {
  try {
    const stat = await dest.client.statObject(dest.bucket, key);
    return stat.size === size;
  } catch {
    return false;
  }
}

async function main() {
  const src = buildSourceClient();
  const dest = DRY_RUN ? null : buildDestClient();

  console.log(`[migrate] Mode : ${DRY_RUN ? 'DRY-RUN (aucune écriture)' : 'RÉEL'}`);
  console.log(`[migrate] Préfixe : ${PREFIX || '(tous)'}`);
  console.log(`[migrate] Manifeste : ${MANIFEST}`);

  const objects = await listObjects(src.client, src.bucket, PREFIX);
  const totalBytes = objects.reduce((sum, o) => sum + (o.size ?? 0), 0);
  const extensions = {};
  for (const o of objects) {
    const ext = (o.key.split('.').pop() ?? '').toLowerCase();
    extensions[ext] = (extensions[ext] ?? 0) + 1;
  }
  console.log(
    `[migrate] Inventaire source : ${objects.length} objets, ${(totalBytes / 1024 / 1024).toFixed(1)} Mo`,
  );
  console.log(`[migrate] Extensions :`, extensions);

  if (DRY_RUN) {
    console.log('[migrate] DRY-RUN terminé — aucun objet copié.');
    return;
  }

  const done = loadDoneSet();
  let copied = 0;
  let skipped = 0;
  let failed = 0;

  for (const obj of objects) {
    if (done.has(obj.key)) {
      skipped++;
      continue;
    }
    // Idempotence : déjà présent et de même taille côté destination.
    if (await destHasSameSize(dest, obj.key, obj.size)) {
      appendFileSync(MANIFEST, JSON.stringify({ key: obj.key, status: 'ok', reason: 'exists' }) + '\n');
      skipped++;
      continue;
    }
    try {
      const stream = await src.client.getObject(src.bucket, obj.key);
      await dest.client.putObject(dest.bucket, obj.key, stream, obj.size);
      // Vérification post-copie.
      if (!(await destHasSameSize(dest, obj.key, obj.size))) {
        throw new Error('taille destination différente après copie');
      }
      appendFileSync(MANIFEST, JSON.stringify({ key: obj.key, status: 'ok', size: obj.size }) + '\n');
      copied++;
      if (copied % 25 === 0) console.log(`[migrate] ${copied} copiés…`);
    } catch (err) {
      failed++;
      appendFileSync(
        MANIFEST,
        JSON.stringify({ key: obj.key, status: 'failed', error: String(err?.message ?? err) }) + '\n',
      );
      console.error(`[migrate] ÉCHEC ${obj.key} : ${err?.message ?? err}`);
    }
  }

  console.log(
    `[migrate] Terminé — copiés: ${copied}, ignorés: ${skipped}, échecs: ${failed} (source intacte).`,
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('[migrate] Erreur fatale :', err?.message ?? err);
  process.exit(1);
});
