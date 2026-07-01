import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface ChecklistTemplateItemInput {
  title: string;
  description?: string;
  responsible?: 'FAMILY' | 'FUNERAL_HOME' | 'BOTH';
  defaultPriority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  requiredDocumentCategoryId?: string;
}

interface CreateChecklistTemplateInput {
  organizationId?: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  items?: ChecklistTemplateItemInput[];
}

@Injectable()
export class ChecklistTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId?: string) {
    return this.prisma.checklistTemplate.findMany({
      where: { organizationId },
      include: { items: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.checklistTemplate.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } },
    });
    if (!template) throw new NotFoundException('Modèle de checklist introuvable');
    return template;
  }

  create(dto: CreateChecklistTemplateInput) {
    return this.prisma.checklistTemplate.create({
      data: {
        organizationId: dto.organizationId,
        name: dto.name,
        description: dto.description,
        isDefault: dto.isDefault ?? false,
        items: dto.items
          ? { create: dto.items.map((item, index) => ({ ...item, order: index })) }
          : undefined,
      },
      include: { items: true },
    });
  }

  async update(id: string, dto: Partial<CreateChecklistTemplateInput>) {
    await this.findOne(id);
    return this.prisma.checklistTemplate.update({
      where: { id },
      data: { name: dto.name, description: dto.description, isDefault: dto.isDefault },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.checklistTemplate.delete({ where: { id } });
    return { success: true };
  }
}
