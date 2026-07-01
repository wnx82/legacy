import { z } from 'zod';

export const ContactRequestSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  subject: z.string().min(1).max(150),
  message: z.string().min(1).max(4000),
});
export type ContactRequestDto = z.infer<typeof ContactRequestSchema>;

export const DemoRequestSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  organizationName: z.string().max(150).optional(),
  message: z.string().max(4000).optional(),
});
export type DemoRequestDto = z.infer<typeof DemoRequestSchema>;
