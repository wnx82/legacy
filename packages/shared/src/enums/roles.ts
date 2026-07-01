export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  FUNERAL_HOME_ADMIN = 'FUNERAL_HOME_ADMIN',
  FUNERAL_ADVISOR = 'FUNERAL_ADVISOR',
  LIVING_USER = 'LIVING_USER',
  TRUSTED_PERSON = 'TRUSTED_PERSON',
  FAMILY_MEMBER = 'FAMILY_MEMBER',
  GUEST_LIMITED = 'GUEST_LIMITED',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super administrateur',
  [UserRole.FUNERAL_HOME_ADMIN]: 'Administrateur pompes funèbres',
  [UserRole.FUNERAL_ADVISOR]: 'Conseiller funéraire',
  [UserRole.LIVING_USER]: 'Utilisateur (dossier vivant)',
  [UserRole.TRUSTED_PERSON]: 'Personne de confiance',
  [UserRole.FAMILY_MEMBER]: 'Membre de la famille',
  [UserRole.GUEST_LIMITED]: 'Invité (accès limité)',
};

export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Gère toute la plateforme Legacy.',
  [UserRole.FUNERAL_HOME_ADMIN]: 'Gère une entreprise de pompes funèbres.',
  [UserRole.FUNERAL_ADVISOR]: 'Accompagne les familles au sein d’une pompe funèbre.',
  [UserRole.LIVING_USER]: 'Prépare son dossier personnel de son vivant.',
  [UserRole.TRUSTED_PERSON]: 'Personne de confiance désignée par un utilisateur vivant.',
  [UserRole.FAMILY_MEMBER]: 'Proche invité pour suivre un dossier décès.',
  [UserRole.GUEST_LIMITED]: 'Accès temporaire limité à certains documents ou tâches.',
};

/** Rôles autorisés à administrer une organisation (pompe funèbre). */
export const ORGANIZATION_ADMIN_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.FUNERAL_HOME_ADMIN];

/** Rôles professionnels, soumis à la 2FA obligatoire. */
export const PROFESSIONAL_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.FUNERAL_HOME_ADMIN,
  UserRole.FUNERAL_ADVISOR,
];
