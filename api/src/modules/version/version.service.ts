import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface VersionInfo {
  /** Version actuellement déployée dans ce conteneur. */
  current: string;
  service: string;
}

export interface VersionCheckResult {
  /** true si la comparaison distante a pu être effectuée. */
  checked: boolean;
  current: string;
  latest: string | null;
  updateAvailable: boolean;
  /** Renseigné uniquement en cas d'échec de la vérification distante. */
  error?: string;
}

/**
 * Expose la version du conteneur et compare la version locale à celle publiée
 * sur GitHub (branche de déploiement). Aucun secret n'est renvoyé au client :
 * le token GitHub n'est utilisé que côté serveur.
 */
@Injectable()
export class VersionService {
  private readonly logger = new Logger(VersionService.name);
  private readonly current: string;

  constructor(private readonly configService: ConfigService) {
    this.current = this.resolveCurrentVersion();
  }

  /**
   * Version du conteneur. Priorité à APP_VERSION (injectée au build/déploiement
   * par Komodo), sinon lecture du package.json du monorepo, sinon "unknown".
   */
  private resolveCurrentVersion(): string {
    const fromEnv = this.configService.get<string>('APP_VERSION');
    if (fromEnv && fromEnv.trim()) return fromEnv.trim();

    // Remonte depuis dist/ (build) ou src/ (dev) jusqu'au package.json racine.
    const candidates = [
      join(process.cwd(), 'package.json'),
      join(process.cwd(), '..', 'package.json'),
      join(__dirname, '..', '..', '..', '..', 'package.json'),
    ];
    for (const path of candidates) {
      try {
        const pkg = JSON.parse(readFileSync(path, 'utf8')) as { version?: string };
        if (pkg.version) return pkg.version;
      } catch {
        // essaie le candidat suivant
      }
    }
    return 'unknown';
  }

  getVersion(): VersionInfo {
    return { current: this.current, service: 'legacy-platform' };
  }

  /**
   * Compare la version locale à la version distante lue via l'API GitHub
   * Contents (package.json de la branche de déploiement).
   */
  async checkForUpdate(): Promise<VersionCheckResult> {
    const repo = this.configService.get<string>('GITHUB_REPO');
    const branch = this.configService.get<string>('GITHUB_BRANCH', 'main');
    const token = this.configService.get<string>('GITHUB_TOKEN');

    if (!repo) {
      return {
        checked: false,
        current: this.current,
        latest: null,
        updateAvailable: false,
        error: 'GITHUB_REPO non configuré',
      };
    }

    try {
      const url = `https://api.github.com/repos/${repo}/contents/package.json?ref=${encodeURIComponent(branch)}`;
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.raw+json',
        'User-Agent': 'legacy-platform-version-check',
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`GitHub API ${response.status}`);
      }
      const pkg = (await response.json()) as { version?: string };
      const latest = pkg.version ?? null;

      return {
        checked: true,
        current: this.current,
        latest,
        updateAvailable: latest ? this.isNewer(latest, this.current) : false,
      };
    } catch (error) {
      // Ne jamais exposer le token ni l'URL complète au client.
      this.logger.warn(`Vérification de version GitHub échouée: ${(error as Error).message}`);
      return {
        checked: false,
        current: this.current,
        latest: null,
        updateAvailable: false,
        error: 'Vérification distante indisponible',
      };
    }
  }

  /** Comparaison semver simple x.y.z (préfixe "v" et suffixes pré-release ignorés). */
  private isNewer(candidate: string, base: string): boolean {
    const parse = (v: string) =>
      v
        .replace(/^v/, '')
        .split('-')[0]
        .split('.')
        .map((n) => Number.parseInt(n, 10) || 0);
    const [a, b] = [parse(candidate), parse(base)];
    for (let i = 0; i < 3; i++) {
      if ((a[i] ?? 0) > (b[i] ?? 0)) return true;
      if ((a[i] ?? 0) < (b[i] ?? 0)) return false;
    }
    return false;
  }
}
