import { z } from 'zod';

export const envSchema = z.object({
  APP_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Runtime applicatif (via PgBouncer en production). Ajouter `?pgbouncer=true`.
  DATABASE_URL: z.string().min(1),
  // Connexion PostgreSQL directe pour les migrations/opérations admin (pg-shared).
  // Optionnelle : en dev local une seule instance existe et DATABASE_URL suffit.
  DATABASE_URL_DIRECT: z.string().optional(),
  REDIS_URL: z.string().min(1),
  // --- Stockage objet : schéma S3_* (Garage partagé) OU MINIO_* (dev local) ---
  // Les deux schémas sont optionnels individuellement ; un superRefine ci-dessous
  // impose qu'au moins l'un des deux soit complet.
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  // URL publique de base des médias publics (ex: https://legacy.media.ekreativ.be).
  PUBLIC_BASE_URL: z.string().optional(),
  MINIO_ENDPOINT: z.string().optional(),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z.coerce.boolean().default(false),
  MINIO_ACCESS_KEY: z.string().optional(),
  MINIO_SECRET_KEY: z.string().optional(),
  MINIO_BUCKET: z.string().optional(),
  MINIO_REGION: z.string().optional(),
  KEYCLOAK_URL: z.string().min(1),
  // URL publique (vue du navigateur) du realm Keycloak, utilisée pour valider
  // le claim `iss` des tokens — diffère de KEYCLOAK_URL dès que l'API atteint
  // Keycloak via un nom d'hôte interne (ex: Docker). Retombe sur KEYCLOAK_URL
  // si absente (cas du développement sans Docker, où les deux URLs sont identiques).
  KEYCLOAK_PUBLIC_URL: z.string().min(1).optional(),
  KEYCLOAK_REALM: z.string().min(1),
  KEYCLOAK_CLIENT_ID: z.string().min(1),
  KEYCLOAK_CLIENT_SECRET: z.string().min(1),
  API_URL: z.string().min(1),
  WEBSITE_URL: z.string().min(1),
  WEB_PRO_URL: z.string().min(1),
  WEB_FAMILY_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  DOWNLOAD_TOKEN_TTL_SECONDS: z.coerce.number().default(300),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().min(1),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  // Antivirus (ClamAV/clamd) optionnel. Si CLAMAV_HOST est absent, le scan est
  // ignoré (statut SKIPPED) mais le checksum SHA-256 est tout de même recalculé.
  CLAMAV_HOST: z.string().optional(),
  CLAMAV_PORT: z.coerce.number().default(3310),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),
  // Version & vérification de mise à jour. APP_VERSION est injectée au
  // build/déploiement (Komodo) ; à défaut, la version du package.json racine
  // est lue au démarrage. GITHUB_* servent uniquement côté serveur à comparer
  // la version locale à la dernière version publiée (aucun secret exposé au client).
  APP_VERSION: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_REPO: z.string().optional(),
  GITHUB_BRANCH: z.string().default('main'),
})
  // Au moins un schéma de stockage objet complet doit être fourni : soit S3_*
  // (Garage partagé), soit MINIO_* (dev local). On ne journalise jamais les
  // valeurs, uniquement l'absence des clés requises.
  .superRefine((cfg, ctx) => {
    const hasS3 = cfg.S3_ENDPOINT && cfg.S3_ACCESS_KEY_ID && cfg.S3_SECRET_ACCESS_KEY && cfg.S3_BUCKET;
    const hasMinio =
      cfg.MINIO_ENDPOINT && cfg.MINIO_ACCESS_KEY && cfg.MINIO_SECRET_KEY && cfg.MINIO_BUCKET;
    if (!hasS3 && !hasMinio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Configuration de stockage objet incomplète : fournir soit S3_* (S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET) soit MINIO_* (MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET).',
      });
    }
  });

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    // Erreur volontairement bloquante au démarrage : mieux vaut un crash au
    // boot qu'un service partiellement configuré en production.
    console.error('Variables d\'environnement invalides :', parsed.error.flatten().fieldErrors);
    throw new Error('Configuration invalide — voir .env.example');
  }
  return parsed.data;
}
