export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string;
  error?: string;
  /** Présent uniquement en environnement de développement (jamais en production, cf. docs/security.md). */
  details?: unknown;
}

export interface AuthenticatedUser {
  id: string;
  keycloakId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  organizationId?: string;
}
