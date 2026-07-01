# Legacy — Base de données

Schéma Prisma / PostgreSQL partagé par l'API NestJS.

## Commandes

```bash
pnpm db:generate   # génère le client Prisma
pnpm db:migrate    # crée/applique une migration en développement
pnpm db:seed       # insère les données de démonstration
pnpm db:studio     # ouvre Prisma Studio
```

## Choix documentés

- **cuid()** plutôt que UUID pour les identifiants : plus courts, triables par
  ordre de création, sans collision, pratique pour les URLs de l'espace famille.
- **Suppression logique évitée** sauf sur `Document` (`deletedAt`) — le reste
  des suppressions RGPD est traité par des jobs dédiés qui suppriment
  réellement les données (voir `docs/rgpd.md`), pas par un simple flag.
- **`Role` / `Permission`** existent en plus de l'enum `UserRole` : l'enum
  couvre les 7 rôles plateforme définis dans le cahier des charges, tandis que
  `Role`/`Permission` permettent à une pompe funèbre de définir des rôles
  personnalisés pour ses collaborateurs (ex. "Conseiller junior") sans
  modifier le schéma.
- **`ChecklistTemplate` / `ChecklistTemplateItem`** génèrent des
  `ChecklistTask` propres à chaque `DeathCase` : la modification d'un modèle
  n'affecte jamais les dossiers déjà créés.
- **Champs `documentId`/`contactId` non contraints** (sur `Asset`,
  `Insurance`, `Subscription`, `Pet`) : liaison optionnelle et souple entre
  modules, volontairement non contrainte par clé étrangère stricte pour cette
  première version — à renforcer en Phase 2 si nécessaire.
- **`estimatedValue` en `Decimal(14,2)`** : jamais de `Float` pour des
  montants financiers.

Voir le détail des entités dans `prisma/schema.prisma` et `docs/architecture.md`.
