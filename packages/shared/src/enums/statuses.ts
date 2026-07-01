export enum LivingProfileStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETE = 'COMPLETE',
}

export enum DeathCaseStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  MISSING_DOCUMENTS = 'MISSING_DOCUMENTS',
  CEREMONY_PLANNED = 'CEREMONY_PLANNED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export const DEATH_CASE_STATUS_LABELS: Record<DeathCaseStatus, string> = {
  [DeathCaseStatus.NEW]: 'Nouveau',
  [DeathCaseStatus.IN_PROGRESS]: 'En cours',
  [DeathCaseStatus.MISSING_DOCUMENTS]: 'Documents manquants',
  [DeathCaseStatus.CEREMONY_PLANNED]: 'Cérémonie planifiée',
  [DeathCaseStatus.COMPLETED]: 'Terminé',
  [DeathCaseStatus.ARCHIVED]: 'Archivé',
};

export enum ChecklistTaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  WAITING_DOCUMENT = 'WAITING_DOCUMENT',
  DONE = 'DONE',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

export const CHECKLIST_TASK_STATUS_LABELS: Record<ChecklistTaskStatus, string> = {
  [ChecklistTaskStatus.TODO]: 'À faire',
  [ChecklistTaskStatus.IN_PROGRESS]: 'En cours',
  [ChecklistTaskStatus.BLOCKED]: 'Bloqué',
  [ChecklistTaskStatus.WAITING_DOCUMENT]: 'En attente de document',
  [ChecklistTaskStatus.DONE]: 'Terminé',
  [ChecklistTaskStatus.NOT_APPLICABLE]: 'Non applicable',
};

export enum ChecklistTaskPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export const CHECKLIST_TASK_PRIORITY_LABELS: Record<ChecklistTaskPriority, string> = {
  [ChecklistTaskPriority.LOW]: 'Basse',
  [ChecklistTaskPriority.NORMAL]: 'Normale',
  [ChecklistTaskPriority.HIGH]: 'Haute',
  [ChecklistTaskPriority.URGENT]: 'Urgente',
};

export enum ResponsibleType {
  FAMILY = 'FAMILY',
  FUNERAL_HOME = 'FUNERAL_HOME',
  BOTH = 'BOTH',
}

export enum AccessGrantStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export enum ExportJobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ExportJobType {
  PDF_LIVING_PROFILE = 'PDF_LIVING_PROFILE',
  PDF_DEATH_CASE = 'PDF_DEATH_CASE',
  ZIP_DOCUMENTS = 'ZIP_DOCUMENTS',
  RGPD_EXPORT = 'RGPD_EXPORT',
  AUDIT_LOG_EXPORT = 'AUDIT_LOG_EXPORT',
}

export enum AssetType {
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  LIFE_INSURANCE = 'LIFE_INSURANCE',
  REAL_ESTATE = 'REAL_ESTATE',
  VEHICLE = 'VEHICLE',
  VALUABLE_ITEM = 'VALUABLE_ITEM',
  INVESTMENT = 'INVESTMENT',
  LOAN = 'LOAN',
  DEBT = 'DEBT',
  EQUIPMENT = 'EQUIPMENT',
  OTHER = 'OTHER',
}

export enum InsuranceType {
  LIFE = 'LIFE',
  HEALTH = 'HEALTH',
  HOME = 'HOME',
  AUTO = 'AUTO',
  OTHER = 'OTHER',
}

export enum SubscriptionCategory {
  BANK = 'BANK',
  INSURANCE = 'INSURANCE',
  ENERGY = 'ENERGY',
  TELECOM = 'TELECOM',
  STREAMING = 'STREAMING',
  CLOUD = 'CLOUD',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  PROFESSIONAL = 'PROFESSIONAL',
  OTHER = 'OTHER',
}

export enum SubscriptionAction {
  CLOSE = 'CLOSE',
  KEEP = 'KEEP',
  TRANSFER = 'TRANSFER',
  CHECK = 'CHECK',
}

export enum ContactCategory {
  FAMILY = 'FAMILY',
  FRIEND = 'FRIEND',
  DOCTOR = 'DOCTOR',
  NOTARY = 'NOTARY',
  BANK = 'BANK',
  INSURER = 'INSURER',
  EMPLOYER = 'EMPLOYER',
  ACCOUNTANT = 'ACCOUNTANT',
  LANDLORD = 'LANDLORD',
  VETERINARIAN = 'VETERINARIAN',
  NEIGHBOR = 'NEIGHBOR',
  PRIORITY_CONTACT = 'PRIORITY_CONTACT',
  OTHER = 'OTHER',
}

export enum WishCategory {
  BURIAL_OR_CREMATION = 'BURIAL_OR_CREMATION',
  CEREMONY_TYPE = 'CEREMONY_TYPE',
  MUSIC = 'MUSIC',
  TEXTS = 'TEXTS',
  FLOWERS = 'FLOWERS',
  CLOTHING = 'CLOTHING',
  PEOPLE_TO_NOTIFY = 'PEOPLE_TO_NOTIFY',
  MESSAGE_TO_LOVED_ONES = 'MESSAGE_TO_LOVED_ONES',
  RELIGIOUS_CHOICE = 'RELIGIOUS_CHOICE',
  ORGAN_DONATION = 'ORGAN_DONATION',
  PREFERRED_FUNERAL_HOME = 'PREFERRED_FUNERAL_HOME',
  OTHER = 'OTHER',
}

/** Statuts pour lesquels un badge "attention" (orange/rouge) est affiché dans l'UI. */
export const ATTENTION_DEATH_CASE_STATUSES: DeathCaseStatus[] = [DeathCaseStatus.MISSING_DOCUMENTS];
export const URGENT_TASK_PRIORITIES: ChecklistTaskPriority[] = [ChecklistTaskPriority.HIGH, ChecklistTaskPriority.URGENT];
