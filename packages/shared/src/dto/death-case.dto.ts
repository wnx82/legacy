import { z } from 'zod';
import { ChecklistTaskPriority, ChecklistTaskStatus, ResponsibleType } from '../enums/statuses';

export const CreateDeathCaseSchema = z.object({
  deceasedFirstName: z.string().min(1).max(80),
  deceasedLastName: z.string().min(1).max(80),
  deceasedBirthDate: z.coerce.date().optional(),
  dateOfDeath: z.coerce.date(),
  placeOfDeath: z.string().max(120).optional(),
  municipality: z.string().max(120).optional(),
  organizationId: z.string().optional(),
  checklistTemplateId: z.string().optional(),
});
export type CreateDeathCaseDto = z.infer<typeof CreateDeathCaseSchema>;

export const UpdateDeathCaseSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'MISSING_DOCUMENTS', 'CEREMONY_PLANNED', 'COMPLETED', 'ARCHIVED']).optional(),
  placeOfDeath: z.string().max(120).optional(),
  municipality: z.string().max(120).optional(),
});
export type UpdateDeathCaseDto = z.infer<typeof UpdateDeathCaseSchema>;

export const CreateChecklistTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  responsible: z.nativeEnum(ResponsibleType).default(ResponsibleType.FAMILY),
  priority: z.nativeEnum(ChecklistTaskPriority).default(ChecklistTaskPriority.NORMAL),
  dueDate: z.coerce.date().optional(),
  requiredDocumentCategoryId: z.string().optional(),
  visibleToFamily: z.boolean().default(true),
  visibleToPro: z.boolean().default(true),
});
export type CreateChecklistTaskDto = z.infer<typeof CreateChecklistTaskSchema>;

export const UpdateChecklistTaskSchema = z.object({
  status: z.nativeEnum(ChecklistTaskStatus).optional(),
  priority: z.nativeEnum(ChecklistTaskPriority).optional(),
  dueDate: z.coerce.date().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
});
export type UpdateChecklistTaskDto = z.infer<typeof UpdateChecklistTaskSchema>;

export const InviteFamilyMemberSchema = z.object({
  email: z.string().email(),
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  relationship: z.string().max(80).optional(),
});
export type InviteFamilyMemberDto = z.infer<typeof InviteFamilyMemberSchema>;

export const CreateNoteSchema = z.object({
  content: z.string().min(1).max(4000),
  visibility: z.enum(['INTERNAL_PRO', 'FAMILY_VISIBLE']).default('INTERNAL_PRO'),
});
export type CreateNoteDto = z.infer<typeof CreateNoteSchema>;
