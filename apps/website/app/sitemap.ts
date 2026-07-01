import type { MetadataRoute } from 'next';
import { GUIDES } from '../lib/content/guides';

const BASE_URL = process.env.WEBSITE_URL ?? 'http://localhost:3000';

const STATIC_ROUTES = [
  '',
  '/particuliers',
  '/familles',
  '/pompes-funebres',
  '/fonctionnalites',
  '/tarifs',
  '/securite',
  '/guides',
  '/a-propos',
  '/contact',
  '/demo',
  '/mentions-legales',
  '/confidentialite',
  '/conditions-utilisation',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));
  const guideEntries = GUIDES.map((guide) => ({
    url: `${BASE_URL}/guides/${guide.slug}`,
    lastModified: new Date(),
  }));
  return [...staticEntries, ...guideEntries];
}
