import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ZodValidationPipe } from 'nestjs-zod';
import { SiteService } from './site.service';
import { Public } from '../../common/decorators/public.decorator';
import { ContactRequestSchema, DemoRequestSchema, type ContactRequestDto, type DemoRequestDto } from '@legacy/shared';

// Limite serrée pour les formulaires publics non authentifiés : 5 soumissions
// par minute et par IP, en plus du pot de miel anti-spam.
const PUBLIC_FORM_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

@ApiTags('site-public')
@Controller()
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Public()
  @Throttle(PUBLIC_FORM_THROTTLE)
  @Post('contact')
  @ApiOperation({ summary: 'Formulaire de contact du site public' })
  createContactRequest(@Body(new ZodValidationPipe(ContactRequestSchema)) dto: ContactRequestDto) {
    return this.siteService.createContactRequest(dto);
  }

  @Public()
  @Throttle(PUBLIC_FORM_THROTTLE)
  @Post('demo-request')
  @ApiOperation({ summary: 'Demande de démo professionnelle (pompes funèbres)' })
  createDemoRequest(@Body(new ZodValidationPipe(DemoRequestSchema)) dto: DemoRequestDto) {
    return this.siteService.createDemoRequest(dto);
  }
}
