import { z } from 'zod';
import { WishCategory, ContactCategory, AssetType, InsuranceType, SubscriptionCategory, SubscriptionAction } from '../enums/statuses';

export const UpdateLivingProfileSchema = z.object({
  birthDate: z.coerce.date().optional(),
  birthPlace: z.string().max(120).optional(),
  nationalNumber: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
});
export type UpdateLivingProfileDto = z.infer<typeof UpdateLivingProfileSchema>;

export const CreateWishSchema = z.object({
  category: z.nativeEnum(WishCategory),
  title: z.string().max(120).optional(),
  content: z.string().min(1).max(4000),
  order: z.number().int().min(0).optional(),
});
export type CreateWishDto = z.infer<typeof CreateWishSchema>;

export const UpdateWishSchema = CreateWishSchema.partial();
export type UpdateWishDto = z.infer<typeof UpdateWishSchema>;

export const CreateContactSchema = z.object({
  category: z.nativeEnum(ContactCategory),
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80).optional(),
  relationship: z.string().max(80).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  address: z.string().max(255).optional(),
  note: z.string().max(1000).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  visibleToFamily: z.boolean().default(true),
  visibleToPro: z.boolean().default(false),
});
export type CreateContactDto = z.infer<typeof CreateContactSchema>;

export const UpdateContactSchema = CreateContactSchema.partial();
export type UpdateContactDto = z.infer<typeof UpdateContactSchema>;

export const CreateTrustedPersonSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  relationship: z.string().max(80).optional(),
  canActivateAccess: z.boolean().default(false),
});
export type CreateTrustedPersonDto = z.infer<typeof CreateTrustedPersonSchema>;

export const CreateAssetSchema = z.object({
  type: z.nativeEnum(AssetType),
  name: z.string().min(1).max(150),
  description: z.string().max(1000).optional(),
  estimatedValue: z.number().nonnegative().optional(),
  note: z.string().max(1000).optional(),
  visibleToFamily: z.boolean().default(false),
  visibleToPro: z.boolean().default(false),
});
export type CreateAssetDto = z.infer<typeof CreateAssetSchema>;

export const CreateInsuranceSchema = z.object({
  type: z.nativeEnum(InsuranceType),
  provider: z.string().min(1).max(150),
  policyNumber: z.string().max(80).optional(),
  note: z.string().max(1000).optional(),
  visibleToFamily: z.boolean().default(false),
  visibleToPro: z.boolean().default(false),
});
export type CreateInsuranceDto = z.infer<typeof CreateInsuranceSchema>;

export const CreateSubscriptionSchema = z.object({
  serviceName: z.string().min(1).max(150),
  category: z.nativeEnum(SubscriptionCategory),
  website: z.string().url().optional(),
  associatedEmail: z.string().email().optional(),
  instruction: z.string().max(1000).optional(),
  desiredAction: z.nativeEnum(SubscriptionAction).default(SubscriptionAction.CHECK),
  note: z.string().max(1000).optional(),
});
export type CreateSubscriptionDto = z.infer<typeof CreateSubscriptionSchema>;

export const CreatePetSchema = z.object({
  name: z.string().min(1).max(80),
  species: z.string().min(1).max(80),
  breed: z.string().max(80).optional(),
  age: z.number().int().nonnegative().optional(),
  veterinarian: z.string().max(150).optional(),
  diet: z.string().max(500).optional(),
  treatment: z.string().max(500).optional(),
  instructions: z.string().max(1000).optional(),
});
export type CreatePetDto = z.infer<typeof CreatePetSchema>;
