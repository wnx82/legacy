# @legacy/shared

Types, DTO (validés avec [Zod](https://zod.dev)), constantes, statuts et
rôles partagés entre l'API NestJS et les trois applications Next.js
(`website`, `web-pro`, `web-family`).

## Pourquoi Zod plutôt que class-validator seul ?

L'API NestJS utilise `nestjs-zod` pour dériver ses DTO directement de ces
schémas (`createZodDto`), ce qui garantit qu'**une seule définition de
validation** est utilisée côté serveur et côté client (formulaires React).
Cela évite la duplication et les désynchronisations entre le NestJS Nest et le Next.js.

## Contenu

- `enums/roles.ts` — les 7 rôles utilisateur de la plateforme.
- `enums/statuses.ts` — statuts de dossiers, tâches, priorités, accès.
- `constants/` — catégories de documents, permissions, avertissements légaux.
- `dto/` — schémas Zod des payloads d'API (dossier vivant, dossier décès,
  checklist, documents, formulaires du site public).
- `types/` — types transverses (pagination, erreurs API, utilisateur authentifié).
