import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import type { ApiErrorBody } from '@legacy/shared';

/**
 * Filtre global : ne jamais renvoyer de stack trace ou de détail interne au
 * client en production (voir docs/security.md — gestion des erreurs sans
 * fuite d'information).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsFilter');
  private readonly isProduction = process.env.APP_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isHttpException
      ? exception.getResponse()
      : 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.';

    this.logger.error(
      `${status} — ${typeof message === 'string' ? message : JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const body: ApiErrorBody = {
      statusCode: status,
      message: typeof message === 'string' ? message : (message as { message?: string }).message ?? 'Erreur',
      ...(this.isProduction ? {} : { details: exception instanceof Error ? exception.stack : exception }),
    };

    response.status(status).json(body);
  }
}
