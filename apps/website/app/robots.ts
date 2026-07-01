import type { MetadataRoute } from 'next';

const BASE_URL = process.env.WEBSITE_URL ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/login', '/register', '/auth/callback', '/compte'] },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
