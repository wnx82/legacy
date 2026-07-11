import { Module } from '@nestjs/common';
import { AccessGrantsService } from './access-grants.service';
import { AccessGrantsController } from './access-grants.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AccessGrantsController],
  providers: [AccessGrantsService],
  exports: [AccessGrantsService],
})
export class AccessGrantsModule {}
