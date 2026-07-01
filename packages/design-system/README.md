# @legacy/design-system

Design system partagé par `apps/website`, `apps/web-pro` et `apps/web-family`.

## Principes

- **Sobre et rassurant** : jamais de rouge/orange en dehors des alertes et
  avertissements réels (voir `tokens.ts`).
- **Gros boutons, formulaires simples, explications courtes** — pensé pour
  des personnes stressées ou en deuil.
- **Accessible** : rôles ARIA sur `Alert`, `ProgressBar`, `Modal` ; contrastes
  du palette validés AA.

## Utilisation

```ts
// tailwind.config.js d'une app Next.js
module.exports = {
  presets: [require('@legacy/design-system/tailwind-preset')],
  content: ['./app/**/*.{ts,tsx}', '../../packages/design-system/src/**/*.{ts,tsx}'],
};
```

```tsx
import { Button, Card, Badge, ProgressBar } from '@legacy/design-system';
```

## Composants disponibles

Button, Card, Badge, Alert, ProgressBar, EmptyState, Skeleton, Breadcrumbs,
Toast, Timeline, ChecklistItem, FileUpload, Modal, Header/Footer/Sidebar.

## Pourquoi pas de librairie de composants tierce (MUI, Chakra…) ?

Le besoin est volontairement restreint (une quinzaine de composants). Une
librairie tierce complète aurait imposé son propre design language, plus
difficile à garder sobre et non générique. Tailwind + composants
« headless maison » donnent un contrôle total sur le ton visuel — critique
pour un produit sensible autour du deuil.
