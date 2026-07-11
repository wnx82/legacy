import { z } from 'zod';

export const envSchema = z.object({
  APP_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  MINIO_ENDPOINT: z.string().min(1),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z.coerce.boolean().default(false),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),
  MINIO_BUCKET: z.string().min(1),
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
