import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './modules/storage/storage.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { QueueModule } from './modules/queue/queue.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { LivingProfileModule } from './modules/living-profile/living-profile.module';
import { DeathCasesModule } from './modules/death-cases/death-cases.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ChecklistTemplatesModule } from './modules/checklist-templates/checklist-templates.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ExportsModule } from './modules/exports/exports.module';
import { StatsModule } from './modules/stats/stats.module';
import { SiteModule } from './modules/site/site.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      // Le monorepo centralise un seul .env à la racine ; on retombe sur un
      // .env local à /api si présent (utile pour des overrides ponctuels).
      envFilePath: ['../.env', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000),
        limit: Number(process.env.RATE_LIMIT_MAX ?? 100),
      },
    ]),
    PrismaModule,
    StorageModule,
    MailerModule,
    QueueModule,
    AuditLogsModule,
    AuthModule,
    OrganizationsModule,
    LivingProfileModule,
    DeathCasesModule,
    DocumentsModule,
    ChecklistTemplatesModule,
    NotificationsModule,
    ExportsModule,
    StatsModule,
    SiteModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
