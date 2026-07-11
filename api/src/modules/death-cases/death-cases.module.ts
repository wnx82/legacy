import { Module } from '@nestjs/common';
import { DeathCasesService } from './death-cases.service';
import { DeathCasesController } from './death-cases.controller';
import { FamilyInvitesController } from './family-invites.controller';
import { DocumentsModule } from '../documents/documents.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [DocumentsModule, QueueModule],
  controllers: [DeathCasesController, FamilyInvitesController],
  providers: [DeathCasesService],
  exports: [DeathCasesService],
})
export class DeathCasesModule {}
