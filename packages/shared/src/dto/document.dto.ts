import { z } from 'zod';
import { ALLOWED_DOCUMENT_MIME_TYPES, DEFAULT_MAX_DOCUMENT_SIZE_MB } from '../constants/document-categories';

export const RequestUploadUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.enum(ALLOWED_DOCUMENT_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(DEFAULT_MAX_DOCUMENT_SIZE_MB * 1024 * 1024),
  categoryKey: z.string().min(1),
  livingProfileId: z.string().optional(),
  deathCaseId: z.string().optional(),
  checklistTaskId: z.string().optional(),
});
export type RequestUploadUrlDto = z.infer<typeof RequestUploadUrlSchema>;

export const UpdateDocumentSchema = z.object({
  categoryKey: z.string().min(1).optional(),
  checklistTaskId: z.string().optional(),
});
export type UpdateDocumentDto = z.infer<typeof UpdateDocumentSchema>;
