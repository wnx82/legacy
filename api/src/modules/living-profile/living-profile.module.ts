import { Module } from '@nestjs/common';
import { LivingProfileService } from './living-profile.service';
import { LivingProfileController } from './living-profile.controller';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [DocumentsModule],
  controllers: [LivingProfileController],
  providers: [LivingProfileService],
  exports: [LivingProfileService],
})
export class LivingProfileModule {}
