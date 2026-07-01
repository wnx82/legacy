import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient } from 'minio';
import { randomUUID } from 'node:crypto';

@Injectable()
export class StorageService {
  private readonly client: MinioClient;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>('MINIO_BUCKET');
    this.client = new MinioClient({
      endPoint: this.configService.getOrThrow<string>('MINIO_ENDPOINT'),
      port: this.configService.get<number>('MINIO_PORT', 9000),
      useSSL: this.configService.get<boolean>('MINIO_USE_SSL', false),
      accessKey: this.configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.getOrThrow<string>('MINIO_SECRET_KEY'),
    });
  }

  buildObjectKey(prefix: string, filename: string): string {
    return `${prefix}/${randomUUID()}-${filename}`.replace(/\s+/g, '_');
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
}
