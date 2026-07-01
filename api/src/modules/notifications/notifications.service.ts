import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { NotificationType } from '@legacy/database';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(userId: string) {
    return this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async markAsRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification introuvable');
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  create(userId: string, type: NotificationType, title: string, body: string, linkUrl?: string) {
    return this.prisma.notification.create({ data: { userId, type, title, body, linkUrl } });
  }
}
