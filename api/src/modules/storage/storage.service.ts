import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient } from 'minio';
import { randomUUID } from 'node:crypto';
import type { Readable } from 'node:stream';

interface ResolvedS3Config {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  region: string;
  bucket: string;
}

/**
 * Stockage objet compatible S3. Fonctionne indifféremment avec :
 *  - Garage S3 (production partagée) via le schéma `S3_*` (S3_ENDPOINT,
 *    S3_ACCESS_KEY_ID, …) — endpoint interne `http://garage:3900`, mode
 *    path-style obligatoire ;
 *  - MinIO (développement local) via le schéma historique `MINIO_*`.
 *
 * Le client `minio` parle le protocole S3 en path-style : il convient aux deux.
 * Les documents restent PRIVÉS (URLs signées temporaires) ; `buildPublicUrl`
 * n'est destiné qu'aux médias réellement publics.
 */
@Injectable()
export class StorageService {
  private readonly client: MinioClient;
  private readonly bucket: string;
  private readonly publicBaseUrl?: string;

  constructor(private readonly configService: ConfigService) {
    const config = this.resolveConfig();
    this.bucket = config.bucket;
    this.publicBaseUrl = this.configService.get<string>('PUBLIC_BASE_URL')?.replace(/\/+$/, '');
    this.client = new MinioClient({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      region: config.region,
      // Garage (comme MinIO) exige l'adressage path-style — jamais virtual-host.
      pathStyle: true,
    });
  }

  /**
   * Résout la configuration en privilégiant le schéma `S3_*` (Garage partagé),
   * avec repli sur `MINIO_*` (dev local). Aucun secret n'est journalisé.
   */
  private resolveConfig(): ResolvedS3Config {
    const cfg = this.configService;
    const s3Endpoint = cfg.get<string>('S3_ENDPOINT');

    if (s3Endpoint) {
      const url = new URL(s3Endpoint);
      const useSSL = url.protocol === 'https:';
      return {
        endPoint: url.hostname,
        port: url.port ? Number(url.port) : useSSL ? 443 : 80,
        useSSL,
        accessKey: cfg.getOrThrow<string>('S3_ACCESS_KEY_ID'),
        secretKey: cfg.getOrThrow<string>('S3_SECRET_ACCESS_KEY'),
        region: cfg.get<string>('S3_REGION', 'garage'),
        bucket: cfg.getOrThrow<string>('S3_BUCKET'),
      };
    }

    return {
      endPoint: cfg.getOrThrow<string>('MINIO_ENDPOINT'),
      port: cfg.get<number>('MINIO_PORT', 9000),
      useSSL: cfg.get<boolean>('MINIO_USE_SSL', false),
      accessKey: cfg.getOrThrow<string>('MINIO_ACCESS_KEY'),
      secretKey: cfg.getOrThrow<string>('MINIO_SECRET_KEY'),
      region: cfg.get<string>('MINIO_REGION', 'us-east-1'),
      bucket: cfg.getOrThrow<string>('MINIO_BUCKET'),
    };
  }

  buildObjectKey(prefix: string, filename: string): string {
    return `${prefix}/${randomUUID()}-${filename}`.replace(/\s+/g, '_');
  }

  /**
   * URL publique d'un objet destiné à être affiché dans un navigateur.
   * À réserver aux médias réellement publics — les documents sensibles passent
   * toujours par des URLs signées temporaires (voir getPresignedDownloadUrl).
   */
  buildPublicUrl(objectKey: string): string {
    if (!this.publicBaseUrl) {
      throw new Error('PUBLIC_BASE_URL non configuré : impossible de construire une URL publique.');
    }
    return `${this.publicBaseUrl}/${objectKey.replace(/^\/+/, '')}`;
  }

  /** URL PUT signée et temporaire — le fichier ne transite jamais par l'API. */
  async getPresignedUploadUrl(objectKey: string, expirySeconds = 300): Promise<string> {
    return this.client.presignedPutObject(this.bucket, objectKey, expirySeconds);
  }

  /** URL GET signée et temporaire — jamais d'URL de téléchargement permanente. */
  async getPresignedDownloadUrl(objectKey: string, expirySeconds = 300): Promise<string> {
    return this.client.presignedGetObject(this.bucket, objectKey, expirySeconds);
  }

  async removeObject(objectKey: string): Promise<void> {
    await this.client.removeObject(this.bucket, objectKey);
  }

  /** Dépose un objet (buffer ou flux) — utilisé par les workers d'export. */
  async putObject(
    objectKey: string,
    body: Buffer | Readable,
    metadata?: Record<string, string>,
  ): Promise<void> {
    await this.client.putObject(this.bucket, objectKey, body, undefined, metadata);
  }

  /** Récupère un objet sous forme de flux lisible — utilisé pour l'archivage ZIP. */
  async getObjectStream(objectKey: string): Promise<Readable> {
    return this.client.getObject(this.bucket, objectKey);
  }

  /** Vérifie la joignabilité du stockage objet (healthcheck) sans exposer de secret. */
  async ping(): Promise<boolean> {
    return this.client.bucketExists(this.bucket);
  }
}
