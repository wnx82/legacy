import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentsService } from '../documents/documents.service';
import type {
  UpdateLivingProfileDto,
  CreateWishDto,
  UpdateWishDto,
  CreateContactDto,
  UpdateContactDto,
  CreateTrustedPersonDto,
  RequestUploadUrlDto,
  CreateAssetDto,
  CreateInsuranceDto,
  CreateSubscriptionDto,
  CreatePetDto,
} from '@legacy/shared';

/**
 * Sections prises en compte dans le score de préparation du dossier vivant.
 * Chaque section pèse le même poids — approche volontairement simple pour
 * le MVP (voir docs/roadmap.md pour une pondération plus fine).
 */
const PROGRESS_SECTIONS = ['profile', 'documents', 'wishes', 'contacts', 'trustedPersons'] as const;

@Injectable()
export class LivingProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
  ) {}

  async getOrCreate(userId: string) {
    let profile = await this.prisma.livingProfile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await this.prisma.livingProfile.create({ data: { userId } });
    }
    return profile;
  }

  async findByUser(userId: string) {
    const profile = await this.prisma.livingProfile.findUnique({
      where: { userId },
      include: { trustedPersons: true, contacts: true, wishes: true },
    });
    if (!profile) throw new NotFoundException("Dossier vivant introuvable — créez-le d'abord.");
    return profile;
  }

  async update(userId: string, dto: UpdateLivingProfileDto) {
    const profile = await this.getOrCreate(userId);
    const updated = await this.prisma.livingProfile.update({ where: { id: profile.id }, data: dto });
    await this.recomputeProgress(profile.id);
    return updated;
  }

  async getProgress(userId: string) {
    const profile = await this.getOrCreate(userId);
    return this.recomputeProgress(profile.id);
  }

  private async recomputeProgress(livingProfileId: string) {
    const profile = await this.prisma.livingProfile.findUniqueOrThrow({
      where: { id: livingProfileId },
      include: {
        documents: true,
        wishes: true,
        contacts: true,
        trustedPersons: true,
      },
    });

    const completed = [
      Boolean(profile.birthDate && profile.address),
      profile.documents.length > 0,
      profile.wishes.length > 0,
      profile.contacts.length > 0,
      profile.trustedPersons.length > 0,
    ].filter(Boolean).length;

    const progressPercent = Math.round((completed / PROGRESS_SECTIONS.length) * 100);
    const status = progressPercent === 0 ? 'DRAFT' : progressPercent === 100 ? 'COMPLETE' : 'IN_PROGRESS';

    await this.prisma.livingProfile.update({
      where: { id: livingProfileId },
      data: { progressPercent, status },
    });

    return { progressPercent, status, sectionsCompleted: completed, totalSections: PROGRESS_SECTIONS.length };
  }

  // --- Documents (métadonnées uniquement — upload via /documents/upload-url) ---
  async listDocuments(userId: string) {
    const profile = await this.getOrCreate(userId);
    return this.prisma.document.findMany({ where: { livingProfileId: profile.id }, include: { category: true } });
  }

  async requestDocumentUpload(userId: string, dto: Omit<RequestUploadUrlDto, 'livingProfileId' | 'deathCaseId'>) {
    const profile = await this.getOrCreate(userId);
    return this.documentsService.requestUploadUrl(dto as RequestUploadUrlDto, {
      userId,
      livingProfileId: profile.id,
    });
  }

  // --- Volontés (non légales) ---
  async listWishes(userId: string) {
    const profile = await this.getOrCreate(userId);
    return this.prisma.wish.findMany({ where: { livingProfileId: profile.id }, orderBy: { order: 'asc' } });
  }

  async createWish(userId: string, dto: CreateWishDto) {
    const profile = await this.getOrCreate(userId);
    const wish = await this.prisma.wish.create({ data: { ...dto, livingProfileId: profile.id } });
    await this.recomputeProgress(profile.id);
    return wish;
  }

  async updateWish(userId: string, wishId: string, dto: UpdateWishDto) {
    const profile = await this.getOrCreate(userId);
    const wish = await this.prisma.wish.findFirst({ where: { id: wishId, livingProfileId: profile.id } });
    if (!wish) throw new NotFoundException('Volonté introuvable');
    return this.prisma.wish.update({ where: { id: wishId }, data: dto });
  }

  // --- Contacts ---
  async listContacts(userId: string) {
    const profile = await this.getOrCreate(userId);
    return this.prisma.contact.findMany({ where: { livingProfileId: profile.id } });
  }

  async createContact(userId: string, dto: CreateContactDto) {
    const profile = await this.getOrCreate(userId);
    const contact = await this.prisma.contact.create({ data: { ...dto, livingProfileId: profile.id } });
    await this.recomputeProgress(profile.id);
    return contact;
  }

  async updateContact(userId: string, contactId: string, dto: UpdateContactDto) {
    const profile = await this.getOrCreate(userId);
    const contact = await this.prisma.contact.findFirst({ where: { id: contactId, livingProfileId: profile.id } });
    if (!contact) throw new NotFoundException('Contact introuvable');
    return this.prisma.contact.update({ where: { id: contactId }, data: dto });
  }

  async deleteContact(userId: string, contactId: string) {
    const profile = await this.getOrCreate(userId);
    const contact = await this.prisma.contact.findFirst({ where: { id: contactId, livingProfileId: profile.id } });
    if (!contact) throw new NotFoundException('Contact introuvable');
    await this.prisma.contact.delete({ where: { id: contactId } });
    return { success: true };
  }

  // --- Personnes de confiance ---
  async listTrustedPersons(userId: string) {
    const profile = await this.getOrCreate(userId);
    return this.prisma.trustedPerson.findMany({ where: { livingProfileId: profile.id } });
  }

  async createTrustedPerson(userId: string, dto: CreateTrustedPersonDto) {
    const profile = await this.getOrCreate(userId);
    const existingCount = await this.prisma.trustedPerson.count({ where: { livingProfileId: profile.id } });
    if (existingCount >= 5) {
      throw new BadRequestException('Vous ne pouvez pas désigner plus de 5 personnes de confiance.');
    }
    const trustedPerson = await this.prisma.trustedPerson.create({ data: { ...dto, livingProfileId: profile.id } });
    await this.recomputeProgress(profile.id);
    return trustedPerson;
  }

  async deleteTrustedPerson(userId: string, trustedPersonId: string) {
    const profile = await this.getOrCreate(userId);
    const trustedPerson = await this.prisma.trustedPerson.findFirst({
      where: { id: trustedPersonId, livingProfileId: profile.id },
    });
    if (!trustedPerson) throw new NotFoundException('Personne de confiance introuvable');
    await this.prisma.trustedPerson.delete({ where: { id: trustedPersonId } });
    return { success: true };
  }

  // --- Patrimoine ---
  async listAssets(userId: string) {
    const profile = await this.getOrCreate(userId);
    return this.prisma.asset.findMany({ where: { livingProfileId: profile.id } });
  }

  async createAsset(userId: string, dto: CreateAssetDto) {
    const profile = await this.getOrCreate(userId);
    return this.prisma.asset.create({ data: { ...dto, livingProfileId: profile.id } });
  }

  // --- Assurances ---
  async listInsurances(userId: string) {
    const profile = await this.getOrCreate(userId);
    return this.prisma.insurance.findMany({ where: { livingProfileId: profile.id } });
  }

  async createInsurance(userId: string, dto: CreateInsuranceDto) {
    const profile = await this.getOrCreate(userId);
    return this.prisma.insurance.create({ data: { ...dto, livingProfileId: profile.id } });
  }

  // --- Abonnements ---
  async listSubscriptions(userId: string) {
    const profile = await this.getOrCreate(userId);
    return this.prisma.subscription.findMany({ where: { livingProfileId: profile.id } });
  }

  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    const profile = await this.getOrCreate(userId);
    return this.prisma.subscription.create({ data: { ...dto, livingProfileId: profile.id } });
  }

  // --- Animaux ---
  async listPets(userId: string) {
    const profile = await this.getOrCreate(userId);
    return this.prisma.pet.findMany({ where: { livingProfileId: profile.id } });
  }

  async createPet(userId: string, dto: CreatePetDto) {
    const profile = await this.getOrCreate(userId);
    return this.prisma.pet.create({ data: { ...dto, livingProfileId: profile.id } });
  }
}
