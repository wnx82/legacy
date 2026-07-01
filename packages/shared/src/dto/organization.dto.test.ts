import { describe, expect, it } from 'vitest';
import { CreateOrganizationSchema } from './organization.dto';

describe('CreateOrganizationSchema', () => {
  it('accepte une organisation valide', () => {
    const result = CreateOrganizationSchema.safeParse({ name: 'Pompes Funèbres Test' });
    expect(result.success).toBe(true);
  });

  it('rejette un nom trop court', () => {
    const result = CreateOrganizationSchema.safeParse({ name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejette un e-mail invalide', () => {
    const result = CreateOrganizationSchema.safeParse({ name: 'Pompes Funèbres Test', email: 'invalide' });
    expect(result.success).toBe(false);
  });
});
