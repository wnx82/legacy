# Versioning & vérification de mise à jour

## Règle de versioning (`x.y.z`)

Le monorepo suit le [Semantic Versioning](https://semver.org/lang/fr/) avec une
convention de décision explicite :

| Segment | Signification | Quand l'incrémenter |
|---------|---------------|---------------------|
| `x` (majeur) | Rupture / grand jalon | **Décision manuelle uniquement** — jamais automatique |
| `y` (mineur) | Évolution | Nouvelle branche de fonctionnalité, grande étape, push significatif |
| `z` (correctif) | Correctif | Bug, responsive, SEO, correction de build, petit ajustement |

`y` et `z` peuvent dépasser 10 sans réinitialisation. Une version existante n'est
jamais réécrite : on repart toujours de la version courante.

La version de référence est celle du **`package.json` racine** (`legacy-platform`).

## Commandes

```bash
pnpm bump:patch   # z+1  — correctif
pnpm bump:minor   # y+1  — évolution
pnpm bump:major   # x+1  — décision manuelle
```

Chaque commande :

1. incrémente `package.json` racine (`npm version … --no-git-tag-version`, sans tag git) ;
2. synchronise la ligne `Version **x.y.z**` du `README.md`
   (`scripts/update-readme-version.js`, idempotent).

Le tag git n'est **pas** créé automatiquement : la version est portée par le
commit et par `CHANGELOG.md`.

## Exposition de la version au runtime

- **`GET /api/version`** — public. Renvoie `{ current, service }`. `current`
  provient de `APP_VERSION` (injectée au déploiement par Komodo) ou, à défaut,
  du `package.json` racine lu au démarrage du conteneur.
- **`GET /api/version-check`** — réservé `SUPER_ADMIN`. Compare la version
  locale à la dernière version publiée sur GitHub (API *Contents* sur la branche
  de déploiement) et renvoie :

  ```ts
  { checked: boolean, current: string, latest: string | null, updateAvailable: boolean }
  ```

  Le `GITHUB_TOKEN` n'est utilisé que côté serveur : il n'est jamais renvoyé au
  navigateur. En cas d'échec réseau, `checked` vaut `false` et aucune donnée
  sensible n'est exposée.

### Variables d'environnement

```dotenv
APP_VERSION=            # injectée au build/déploiement ; sinon package.json racine
GITHUB_TOKEN=           # PAT à portée lecture (contents:read) — serveur uniquement
GITHUB_REPO=owner/repo  # dépôt de déploiement
GITHUB_BRANCH=main      # branche suivie pour la comparaison
```

## Composant `VersionWidget` (portail pro)

`apps/web-pro/components/VersionWidget.tsx` — client component, deux variantes :

- `variant="full"` : carte de tableau de bord (version, badge « à jour » /
  « mise à jour disponible », bouton *Rafraîchir*) ;
- `variant="compact"` : pastille discrète pour une barre de navigation.

Pour un rôle non `SUPER_ADMIN`, `/version-check` renvoie 403 ; le widget retombe
alors proprement sur `/version` (version publique) sans afficher d'état de MAJ.
