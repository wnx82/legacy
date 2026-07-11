import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect } from 'node:net';
import type { Readable } from 'node:stream';

export type ScanVerdict = { status: 'CLEAN' } | { status: 'INFECTED'; signature: string } | { status: 'SKIPPED' };

/**
 * Scan antivirus via clamd (protocole INSTREAM sur TCP). Activé uniquement si
 * `CLAMAV_HOST` est configuré ; sinon le scan est ignoré (`SKIPPED`) — jamais
 * un faux « CLEAN ». Aucune dépendance externe : implémentation directe du
 * protocole clamd (envoi de la taille de chaque chunk en big-endian, chunk
 * final de longueur zéro, lecture de la réponse `stream: OK` / `... FOUND`).
 */
@Injectable()
export class AntivirusService {
  private readonly logger = new Logger(AntivirusService.name);
  private readonly host?: string;
  private readonly port: number;

  constructor(config: ConfigService) {
    this.host = config.get<string>('CLAMAV_HOST');
    this.port = config.get<number>('CLAMAV_PORT', 3310);
  }

  get enabled(): boolean {
    return Boolean(this.host);
  }

  async scanStream(source: Readable): Promise<ScanVerdict> {
    if (!this.host) {
      // Consomme le flux pour éviter les fuites de descripteurs.
      source.resume();
      return { status: 'SKIPPED' };
    }

    return new Promise<ScanVerdict>((resolve, reject) => {
      const socket = connect(this.port, this.host, () => {
        socket.write('zINSTREAM\0');
        source.on('data', (chunk: Buffer) => {
          const size = Buffer.alloc(4);
          size.writeUInt32BE(chunk.length, 0);
          socket.write(size);
          socket.write(chunk);
        });
        source.on('end', () => {
          const terminator = Buffer.alloc(4); // longueur 0 => fin du flux
          socket.write(terminator);
        });
        source.on('error', (err) => {
          socket.destroy();
          reject(err);
        });
      });

      let response = '';
      socket.setTimeout(30_000);
      socket.on('data', (data) => (response += data.toString('utf-8')));
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Timeout du scan antivirus (clamd)'));
      });
      socket.on('error', reject);
      socket.on('close', () => {
        const clean = /stream:\s*OK/i.test(response);
        const found = response.match(/stream:\s*(.+)\s+FOUND/i);
        if (found) {
          resolve({ status: 'INFECTED', signature: found[1].trim() });
        } else if (clean) {
          resolve({ status: 'CLEAN' });
        } else {
          reject(new Error(`Réponse clamd inattendue : ${response.trim() || '(vide)'}`));
        }
      });
    });
  }
}
