import { VersionService } from './version.service';
import type { ConfigService } from '@nestjs/config';

/** ConfigService factice piloté par une map de valeurs. */
function configMock(values: Record<string, string | undefined>): ConfigService {
  return {
    get: (key: string, fallback?: unknown) => values[key] ?? fallback,
  } as unknown as ConfigService;
}

describe('VersionService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('expose la version fournie par APP_VERSION', () => {
    const service = new VersionService(configMock({ APP_VERSION: '2.3.4' }));
    expect(service.getVersion()).toEqual({ current: '2.3.4', service: 'legacy-platform' });
  });

  it('retourne checked=false si GITHUB_REPO est absent, sans appel réseau', async () => {
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;
    const service = new VersionService(configMock({ APP_VERSION: '1.2.0' }));

    const result = await service.checkForUpdate();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.checked).toBe(false);
    expect(result.updateAvailable).toBe(false);
    expect(result.current).toBe('1.2.0');
  });

  it('détecte une mise à jour disponible quand la version distante est plus récente', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: '1.3.0' }),
    }) as unknown as typeof fetch;

    const service = new VersionService(
      configMock({ APP_VERSION: '1.2.0', GITHUB_REPO: 'owner/repo', GITHUB_TOKEN: 't' }),
    );
    const result = await service.checkForUpdate();

    expect(result.checked).toBe(true);
    expect(result.latest).toBe('1.3.0');
    expect(result.updateAvailable).toBe(true);
  });

  it("ne signale pas de mise à jour quand les versions sont égales", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: '1.2.0' }),
    }) as unknown as typeof fetch;

    const service = new VersionService(configMock({ APP_VERSION: '1.2.0', GITHUB_REPO: 'owner/repo' }));
    const result = await service.checkForUpdate();

    expect(result.updateAvailable).toBe(false);
  });

  it('renvoie checked=false et aucun secret en cas d\'erreur GitHub', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 403 }) as unknown as typeof fetch;

    const service = new VersionService(
      configMock({ APP_VERSION: '1.2.0', GITHUB_REPO: 'owner/repo', GITHUB_TOKEN: 'super-secret-token' }),
    );
    const result = await service.checkForUpdate();

    expect(result.checked).toBe(false);
    expect(result.latest).toBeNull();
    expect(JSON.stringify(result)).not.toContain('super-secret-token');
  });
});
