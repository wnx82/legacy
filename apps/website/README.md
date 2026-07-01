# Legacy — Site public

Site vitrine Next.js (App Router) : présentation, conversion, guides, SEO.

## Démarrer

```bash
pnpm --filter @legacy/website dev
```

## Choix documentés

- **App Router + composants serveur par défaut** : les pages de contenu
  (accueil, guides, pages légales) sont statiques/serveur pour un meilleur
  SEO et de meilleures performances ; seuls les formulaires
  (`ContactForm`, `DemoRequestForm`) et le bouton Keycloak sont des
  composants client.
- **Redirection Keycloak plutôt que formulaire de connexion maison** : le
  site ne gère jamais de mot de passe. `/login` et `/register` redirigent
  vers les endpoints `auth`/`registrations` du realm Keycloak (voir
  `lib/keycloak.ts`).
- **Umami pour les statistiques** (`components/UmamiScript.tsx`) : chargé
  uniquement si `NEXT_PUBLIC_UMAMI_URL`/`NEXT_PUBLIC_UMAMI_WEBSITE_ID` sont
  renseignés, pour ne rien casser tant qu'Umami n'a pas été configuré.
- **SEO** : métadonnées par page (`generateMetadata`/`export const
  metadata`), `app/sitemap.ts` et `app/robots.ts` générés dynamiquement,
  Open Graph sur le layout racine, structure sémantique H1/H2.
- **Guides en contenu statique typé** (`lib/content/guides.ts`) plutôt
  qu'en base de données pour le MVP : plus simple à versionner et à
  relire avant publication. Les articles concernant des formalités belges
  sont marqués `requiresOfficialVerification` et affichent un avertissement
  — **à vérifier avec des sources officielles avant mise en production**
  (voir `docs/product.md`).
