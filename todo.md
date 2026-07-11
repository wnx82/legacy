# TODO

État du projet audité sur le code présent dans ce dépôt le 2026-07-11.
Ce fichier remplace l'ancien suivi devenu obsolète.

## Priorité haute

- [ ] Rejouer les parcours e2e avec la stack complète.
  À valider quand Keycloak et MinIO tournent réellement ensemble :
  connexion complète, invitation famille bout à bout, upload/scan/download de
  documents, export PDF/ZIP/RGPD avec objets réellement stockés.

- [ ] Vérifier l'exécution réelle de l'app Flutter sur machine équipée.
  Le flux OIDC desktop est implémenté, mais le SDK Flutter n'est pas présent
  dans cet environnement pour l'exécuter à chaud.

- [ ] Planifier la montée Next.js `14 -> 15`.
  Le dépôt est stable aujourd'hui, mais la montée majeure reste un chantier de
  sécurité/maintenance à traiter avec campagne de non-régression dédiée.

## Priorité moyenne

- [ ] Ajouter de vrais tests d'intégration/e2e automatisés.
  Les tests unitaires et de service sont déjà bons, mais la couverture des
  parcours transverses peut encore monter, surtout autour de Keycloak, MinIO
  et BullMQ.

- [ ] Finaliser l'UI de permissions fines côté portail pro.
  Le catalogue `Role` / `Permission` existe et le seed est prêt ; il manque la
  composition produit de rôles personnalisés.

- [ ] Renforcer le chiffrement applicatif des champs les plus sensibles.
  Le stockage et les flux sont déjà cadrés, mais certains champs métier
  sensibles méritent encore un chiffrement applicatif dédié.

## Déjà en place

- [x] Exports PDF/ZIP réels avec workers BullMQ.
- [x] Export RGPD JSON et suppression de compte (anonymisation + purge MinIO).
- [x] Invitations famille par e-mail avec acceptation sécurisée.
- [x] Exposition sécurisée des contacts et volontés partagés à la famille.
- [x] `AccessGrant` avec demande, activation, suspension, révocation.
- [x] Checksum SHA-256 réel et scan antivirus post-upload.
- [x] Sauvegarde/restauration chiffrées documentées.
- [x] Audit logs et tableau de bord d'audit.
- [x] Améliorations d'accessibilité des formulaires publics et d'invitation.
- [x] Renfort de la couverture de tests sur invitations famille et exports.

## Lecture honnête du statut

Le dépôt est désormais bien plus proche d'une version `1.1.x` solide que d'un
simple scaffold MVP. Les principaux écarts restants concernent surtout la
vérification en environnement complet, la montée de dépendances majeures et
quelques chantiers de durcissement/produit non bloquants pour le développement
local.
