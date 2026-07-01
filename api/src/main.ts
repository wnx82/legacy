import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.use(compression());

  const allowedOrigins = [
    configService.get<string>('WEBSITE_URL'),
    configService.get<string>('WEB_PRO_URL'),
    configService.get<string>('WEB_FAMILY_URL'),
  ].filter(Boolean);
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
