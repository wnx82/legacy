import Script from 'next/script';

/**
 * Statistiques d'audience via Umami (auto-hébergé, sans cookies, sans donnée
 * personnelle) — voir infra/README.md et docs/rgpd.md. Ne se charge que si
 * les variables d'environnement sont renseignées (absentes par défaut en
 * développement tant qu'Umami n'a pas été configuré manuellement).
 */
export function UmamiScript() {
  const src = process.env.NEXT_PUBLIC_UMAMI_URL;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!src || !websiteId) return null;

  return <Script async defer src={src} data-website-id={websiteId} strategy="afterInteractive" />;
}
