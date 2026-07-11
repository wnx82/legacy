import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: false });
  const configService = app.get(ConfigService);
  const isProduction = configService.get<string>('APP_ENV') === 'production';

  // Derrière un reverse proxy (Traefik/Nginx) : fait confiance au premier proxy
  // pour X-Forwarded-* afin d'obtenir la vraie IP client (rate limiting, audit).
  app.set('trust proxy', 1);
  // Ne pas divulguer la stack technique.
  app.disable('x-powered-by');

  app.use(
    helmet({
      // HSTS uniquement en production (évite d'épingler HTTPS en dev local).
      hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
      // L'API est en JSON pur (pas de HTML servi) : une CSP stricte est sûre.
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'none'"],
        },
      },
      referrerPolicy: { policy: 'no-referrer' },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );
  app.use(compression());
  // Limite la taille des corps de requête (les fichiers vont directement en
  // MinIO via URL signée : l'API ne reçoit que du JSON de métadonnées).
  app.use(json({ limit: '256kb' }));
  app.use(urlencoded({ extended: true, limit: '256kb' }));

  const allowedOrigins = [
    configService.get<string>('WEBSITE_URL'),
    configService.get<string>('WEB_PRO_URL'),
    configService.get<string>('WEB_FAMILY_URL'),
  ].filter((origin): origin is string => Boolean(origin));
  app.enableCors({ origin: allowedOrigins, credentials: true });

  app.setGlobalPrefix('api', { exclude: ['health'] });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Legacy API')
    .setDescription(
      "API de la plateforme Legacy — dossier vivant, dossier décès, checklist de formalités, documents, " +
        "accès après décès, statistiques. Legacy ne remplace pas un notaire, un avocat ou un testament légal.",
    )
    .setVersion('0.5.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('organizations')
    .addTag('living-profile')
    .addTag('death-cases')
    .addTag('documents')
    .addTag('checklist-templates')
    .addTag('notifications')
    .addTag('exports')
    .addTag('audit-logs')
    .addTag('stats')
    .addTag('site-public')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Legacy API démarrée sur http://localhost:${port}/api — Swagger sur /api/docs`);
}

bootstrap();
