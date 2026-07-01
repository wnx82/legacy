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

Restant à finaliser avant un usage réel (dette technique assumée du MVP) :

- [ ] Rendu réel des PDF/ZIP dans les processeurs BullMQ
      (`api/src/modules/queue/processors/`).
- [ ] Flux d'invitation famille par e-mail (actuellement : lien avec
      `?dossier=<id>` à transmettre manuellement).
- [ ] Endpoint exposant les contacts/volontés du dossier vivant du défunt à
      la famille d'un dossier décès lié.
- [ ] Authentification OpenID Connect desktop pour l'app Flutter (Windows/
      macOS/Linux).
- [ ] Vérification des formalités belges de la checklist par défaut et des
      guides avec des sources officielles (SPF Intérieur, communes, notaire.be).

## Phase 2 — Sécurité avancée

- [ ] Chiffrement applicatif renforcé des champs les plus sensibles
      (ex: numéro de registre national).
- [ ] 2FA complet et éprouvé en conditions réelles (tests de bout en bout).
- [ ] Audit logs détaillés (couverture complète de toutes les actions
      sensibles listées dans `security.md`, tableaux de bord d'audit).
- [ ] Activation/validation réelle des accès après décès (`AccessGrant`) :
      endpoints, notifications, révocation.
- [ ] Sauvegardes chiffrées automatisées (PostgreSQL + MinIO).
- [ ] Export RGPD complet (toutes les données d'un utilisateur, format
      structuré) et suppression de compte en cascade.
- [ ] Gestion avancée des permissions (`Role`/`Permission` déjà modélisés,
      UI de configuration à construire côté portail pro).
- [ ] Scan antivirus des documents uploadés.

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
