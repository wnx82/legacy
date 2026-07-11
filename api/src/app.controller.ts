import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { PrismaService } from './prisma/prisma.service';
import { StorageService } from './modules/storage/storage.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /** Liveness — le process répond. N'expose aucune dépendance ni secret. */
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'legacy-api', timestamp: new Date().toISOString() };
  }

  /**
   * Readiness — vérifie PostgreSQL et le stockage objet. Le stockage est
   * traité comme non critique (seules les fonctionnalités médias en dépendent) :
   * son indisponibilité renvoie `degraded`, pas `error`. Aucun secret, aucune
   * URL avec credentials, aucune trace SQL n'est renvoyée au client.
   */
  @Public()
  @Get('health/ready')
  @ApiOperation({ summary: 'Readiness — état PostgreSQL et stockage objet (sans secret)' })
  async ready() {
    const [database, storage] = await Promise.all([this.checkDatabase(), this.checkStorage()]);
    const status = !database ? 'error' : storage ? 'ok' : 'degraded';
    return {
      status,
      checks: {
        database: database ? 'up' : 'down',
        storage: storage ? 'up' : 'down',
      },
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async checkStorage(): Promise<boolean> {
    try {
      return await this.storage.ping();
    } catch {
      return false;
    }
  }
}
