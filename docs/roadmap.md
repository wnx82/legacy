# Roadmap

## Phase 1 — MVP (ce dépôt)

Livré dans ce scaffold initial (versions 0.1.0 à 1.0.0, voir `CHANGELOG.md`) :

- [x] Site public (Next.js) avec SEO et statistiques Umami.
- [x] Authentification Keycloak (rôles, 2FA pour les professionnels).
- [x] Portail professionnel : dossiers décès, checklist, documents, famille,
      collaborateurs, statistiques.
- [x] Espace famille : checklist, documents, messages, export.
- [x] Dossier vivant : documents, contacts, volontés, personnes de
      confiance, patrimoine, assurances, abonnements, animaux.
- [x] Application Flutter (Android/iOS/Windows/macOS/Linux) avec les écrans
      principaux.
- [x] Export PDF (déclenchement asynchrone — rendu réel à finaliser).
- [x] Docker Compose complet et documentation d'installation locale.

Finalisé lors de la campagne 1.1.0 (2026-07-11, voir `CHANGELOG.md` et
`docs/AUDIT_FINAL.md`) :

- [x] Rendu réel des PDF/ZIP dans les processeurs BullMQ (pdfkit + archiver).
- [x] Flux d'invitation famille par e-mail (jeton fort, endpoints resolve/accept).
- [x] Endpoints exposant les contacts/volontés du défunt à la famille (sécurisés).
- [x] Authentification OpenID Connect desktop pour l'app Flutter (loopback PKCE) —
      code complet, exécution à vérifier sur machine équipée du SDK.
- [x] Vérification et datation des formalités belges (belgium.be, notaire.be,
      SPF Finances) — voir `docs/product.md`.

## Phase 2 — Sécurité avancée

Livré en 1.1.0 :

- [x] Activation/validation réelle des accès après décès (`AccessGrant`) :
      endpoints, notifications, révocation.
- [x] Sauvegardes chiffrées automatisées (PostgreSQL + MinIO) — `infra/scripts/`.
- [x] Export RGPD complet et suppression de compte en cascade.
- [x] Scan antivirus des documents uploadés (clamd) + checksum SHA-256 réel.
- [x] Audit logs élargis + tableau de bord d'audit (`GET /audit-logs/summary`,
      page « Journal d'audit »).
- [x] Catalogue de permissions fines semé (`Role`/`Permission`).

Restant :

- [ ] Chiffrement applicatif renforcé des champs les plus sensibles
      (ex: numéro de registre national).
- [ ] 2FA complet et éprouvé en conditions réelles (tests de bout en bout).
- [ ] UI de composition des rôles personnalisés côté portail pro (le catalogue
      de permissions est déjà alimenté).

## Phase 3 — Produit commercial

- [ ] Abonnements pompes funèbres et paiement (offres Gratuit/Plus/Pro déjà
      esquissées sur `/tarifs`).
- [ ] Marque blanche complète (domaine personnalisé, thème par organisation
      — les champs `logoUrl`/`primaryColor`/`secondaryColor` existent déjà
      sur `Organization`/`FuneralHomeSettings`).
- [ ] Statistiques avancées et tableaux de bord comparatifs multi-agences.
- [ ] Modèles de checklist et de messages personnalisables en profondeur.
- [ ] Démo commerciale interactive.
- [ ] Gestion multi-agences pour les groupes de pompes funèbres.

## Phase 4 — Fonctionnalités avancées

- [ ] Assistance rédactionnelle par IA (ex: aide à la rédaction des
      volontés, résumés de dossier).
- [ ] OCR des documents uploadés (reconnaissance automatique de catégorie).
- [ ] Suggestions de checklist adaptées au profil du dossier.
- [ ] Application mobile enrichie (notifications push, mode hors-ligne).
- [ ] Intégrations externes (banques, assureurs, notaires) — sous réserve
      de cadre juridique et technique validé.
- [ ] Marketplace de partenaires (notaires, assureurs, associations).
- [ ] Intégration eID / Itsme, si pertinent juridiquement et techniquement.

## Fonctionnalités volontairement exclues du MVP

Conformément au cahier des charges produit : signature électronique,
testament légal, détection automatique du décès, synchronisation directe
avec l'administration belge, coffre de mots de passe complet.
