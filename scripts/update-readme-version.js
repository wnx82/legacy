#!/usr/bin/env node
/**
 * Synchronise la version affichée dans README.md avec celle du package.json
 * racine. Appelé automatiquement par `pnpm bump:patch` / `pnpm bump:minor`.
 *
 * Règle de versioning du projet (voir docs/versioning.md) :
 *   x.y.z — x : majeur (décision manuelle uniquement)
 *           y : évolution (nouvelle branche / grande étape)
 *           z : correctif (bug, responsive, SEO, build, ajustement)
 *
 * Idempotent : ne modifie rien si la version est déjà à jour.
 */
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = pkg.version;

const readmePath = join(root, 'README.md');
let readme = readFileSync(readmePath, 'utf8');

// Remplace toutes les occurrences de `Version **X.Y.Z**` par la version courante.
const pattern = /Version \*\*\d+\.\d+\.\d+\*\*/g;
const replacement = `Version **${version}**`;

if (!pattern.test(readme)) {
  console.warn(
    `[update-readme-version] Aucun marqueur "Version **x.y.z**" trouvé dans README.md — rien à mettre à jour.`,
  );
  process.exit(0);
}

const updated = readme.replace(pattern, replacement);
if (updated === readme) {
  console.log(`[update-readme-version] README déjà à jour (v${version}).`);
  process.exit(0);
}

writeFileSync(readmePath, updated);
console.log(`[update-readme-version] README mis à jour → v${version}.`);
