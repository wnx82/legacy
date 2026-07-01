/**
 * Clés de permissions fines (utilisées par les Role/Permission personnalisés
 * d'une organisation, en complément des 7 rôles plateforme de base).
 */
export const PERMISSIONS = {
  DEATH_CASE_READ: 'death_case.read',
  DEATH_CASE_WRITE: 'death_case.write',
  DEATH_CASE_ARCHIVE: 'death_case.archive',
  DOCUMENT_READ: 'document.read',
  DOCUMENT_DOWNLOAD: 'document.download',
  DOCUMENT_DELETE: 'document.delete',
  CHECKLIST_TEMPLATE_MANAGE: 'checklist_template.manage',
  ORGANIZATION_MEMBERS_MANAGE: 'organization.members.manage',
  ORGANIZATION_SETTINGS_MANAGE: 'organization.settings.manage',
  FAMILY_INVITE: 'family.invite',
  AUDIT_LOG_READ: 'audit_log.read',
  EXPORT_CREATE: 'export.create',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
