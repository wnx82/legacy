import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Marque une route comme accessible sans authentification (ex: /contact, /demo-request, /health). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
