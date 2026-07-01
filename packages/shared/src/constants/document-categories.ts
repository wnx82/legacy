export const DOCUMENT_CATEGORIES = [
  { key: 'identity', label: 'Identité' },
  { key: 'health', label: 'Santé' },
  { key: 'insurance', label: 'Assurance' },
  { key: 'bank', label: 'Banque' },
  { key: 'housing', label: 'Logement' },
  { key: 'succession', label: 'Succession' },
  { key: 'ceremony', label: 'Cérémonie' },
  { key: 'family', label: 'Famille' },
  { key: 'pets', label: 'Animaux' },
  { key: 'vehicles', label: 'Véhicules' },
  { key: 'work', label: 'Travail' },
  { key: 'taxes', label: 'Fiscalité' },
  { key: 'other', label: 'Autres' },
] as const;

export type DocumentCategoryKey = (typeof DOCUMENT_CATEGORIES)[number]['key'];

/** Taille maximale par fichier (Mo) — configurable via variable d'environnement côté API. */
export const DEFAULT_MAX_DOCUMENT_SIZE_MB = 20;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/heic',
] as const;
