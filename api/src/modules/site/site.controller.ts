import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { SiteService } from './site.service';
import { Public } from '../../common/decorators/public.decorator';
import { ContactRequestSchema, DemoRequestSchema, type ContactRequestDto, type DemoRequestDto } from '@legacy/shared';

@ApiTags('site-public')
@Controller()
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Public()
  @Post('contact')
  @ApiOperation({ summary: 'Formulaire de contact du site public' })
  createContactRequest(@Body(new ZodValidationPipe(ContactRequestSchema)) dto: ContactRequestDto) {
    return this.siteService.createContactRequest(dto);
  }

  @Public()
  @Post('demo-request')
  @ApiOperation({ summary: 'Demande de démo professionnelle (pompes funèbres)' })
  createDemoRequest(@Body(new ZodValidationPipe(DemoRequestSchema)) dto: DemoRequestDto) {
    return this.siteService.createDemoRequest(dto);
  }
}
