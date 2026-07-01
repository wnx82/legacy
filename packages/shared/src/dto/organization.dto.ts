import { z } from 'zod';

export const CreateOrganizationSchema = z.object({
  name: z.string().min(2).max(120),
  address: z.string().max(255).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  vatNumber: z.string().max(30).optional(),
});
export type CreateOrganizationDto = z.infer<typeof CreateOrganizationSchema>;

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();
export type UpdateOrganizationDto = z.infer<typeof UpdateOrganizationSchema>;

export const UpdateOrganizationSettingsSchema = z.object({
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  messageTemplates: z.record(z.string()).optional(),
  defaultChecklistTemplateId: z.string().optional(),
});
export type UpdateOrganizationSettingsDto = z.infer<typeof UpdateOrganizationSettingsSchema>;

export const InviteOrganizationMemberSchema = z.object({
  email: z.string().email(),
  baseRole: z.enum(['FUNERAL_HOME_ADMIN', 'FUNERAL_ADVISOR']),
});
export type InviteOrganizationMemberDto = z.infer<typeof InviteOrganizationMemberSchema>;

export const UpdateOrganizationMemberSchema = z.object({
  baseRole: z.enum(['FUNERAL_HOME_ADMIN', 'FUNERAL_ADVISOR']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'REMOVED']).optional(),
});
export type UpdateOrganizationMemberDto = z.infer<typeof UpdateOrganizationMemberSchema>;
