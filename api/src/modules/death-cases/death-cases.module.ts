import { Module } from '@nestjs/common';
import { DeathCasesService } from './death-cases.service';
import { DeathCasesController } from './death-cases.controller';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [DocumentsModule],
  controllers: [DeathCasesController],
  providers: [DeathCasesService],
  exports: [DeathCasesService],
})
export class DeathCasesModule {}
