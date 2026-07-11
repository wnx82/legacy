import { z } from 'zod';

/**
 * Champ « pot de miel » anti-spam : invisible pour un humain (masqué en CSS),
 * il ne doit jamais être rempli. S'il l'est, la requête provient très
 * probablement d'un bot : le serveur renvoie un succès factice sans rien
 * persister (comportement silencieux, ne révèle pas le piège).
 */
const honeypot = z.string().max(200).optional();

export const ContactRequestSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  subject: z.string().min(1).max(150),
  message: z.string().min(1).max(4000),
  website: honeypot,
});
export type ContactRequestDto = z.infer<typeof ContactRequestSchema>;

export const DemoRequestSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  organizationName: z.string().max(150).optional(),
  message: z.string().max(4000).optional(),
  website: honeypot,
});
export type DemoRequestDto = z.infer<typeof DemoRequestSchema>;
