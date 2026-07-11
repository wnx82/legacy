import { z } from 'zod';

/** Catégories de données d'un dossier vivant partageables après décès. */
export const ACCESS_GRANT_CATEGORIES = ['documents', 'contacts', 'wishes', 'assets', 'insurances', 'subscriptions'] as const;
export type AccessGrantCategory = (typeof ACCESS_GRANT_CATEGORIES)[number];

export const RequestAccessGrantSchema = z.object({
  livingProfileId: z.string().min(1),
  grantedToUserId: z.string().min(1),
  allowedCategories: z.array(z.enum(ACCESS_GRANT_CATEGORIES)).min(1).optional(),
  activationReason: z
    .enum(['DEATH_CERTIFICATE', 'MANUAL_TRUSTED_PERSON', 'MANUAL_FUNERAL_HOME'])
    .optional(),
  deathCertificateDocumentId: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
});
export type RequestAccessGrantDto = z.infer<typeof RequestAccessGrantSchema>;

export const ActivateAccessGrantSchema = z.object({
  activationReason: z.enum(['DEATH_CERTIFICATE', 'MANUAL_TRUSTED_PERSON', 'MANUAL_FUNERAL_HOME']),
  deathCertificateDocumentId: z.string().optional(),
  allowedCategories: z.array(z.enum(ACCESS_GRANT_CATEGORIES)).min(1).optional(),
  expiresAt: z.coerce.date().optional(),
});
export type ActivateAccessGrantDto = z.infer<typeof ActivateAccessGrantSchema>;
