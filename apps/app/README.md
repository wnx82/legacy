# Legacy — Application (Flutter)

Application personnelle Legacy, compatible Android, iOS, Windows, macOS et
Linux à partir d'une seule base de code.

## Démarrer

```bash
flutter pub get
flutter run --dart-define=API_URL=http://localhost:3001/api \
            --dart-define=KEYCLOAK_DISCOVERY_URL=http://localhost:8080/realms/legacy/.well-known/openid-configuration
```

## Choix documentés

- **go_router** pour une navigation déclarative unique, avec redirection
  automatique selon l'état d'authentification (`router.dart`).
- **provider** pour l'injection de `AuthService`/`ApiClient` — volontairement
  simple plutôt que Riverpod/Bloc, suffisant pour la taille de l'app MVP.
- **flutter_secure_storage** pour le token d'accès (Keystore Android /
  Keychain iOS-macOS / libsecret Linux / Credential Manager Windows) —
  jamais de token en `SharedPreferences`.
- **flutter_appauth** pour l'authentification OpenID Connect (Authorization
  Code + PKCE) auprès de Keycloak, cohérent avec les trois apps Next.js.

### Authentification desktop

`flutter_appauth` fonctionne nativement sur Android et iOS. Sur Windows,
macOS et Linux, le flux de redirection nécessite un serveur de callback
local (écoute sur `http://localhost:<port>/callback`) plutôt que le schéma
personnalisé `legacy://callback` utilisé sur mobile — cette adaptation est
prévue en Phase 1 (voir `docs/roadmap.md`) et n'est pas encore implémentée
dans ce scaffold. Le code d'authentification (`lib/services/auth_service.dart`)
est isolé pour faciliter cet ajout sans toucher au reste de l'application.

### Modules avec limitations connues (MVP)

- **Checklist famille** (`family_checklist_screen.dart`) : l'identifiant du
  dossier décès est saisi manuellement en attendant l'intégration d'un
  deep link d'invitation (`legacy://family?dossier=<id>`).
- **Patrimoine / Assurances / Abonnements / Animaux** : CRUD minimal
  (liste + création via l'API), sans formulaire dédié par module dans cette
  première version — voir `widgets/simple_list_screen.dart`.

## Écrans

Onboarding, connexion, création de compte, tableau de bord, progression du
dossier vivant, documents (+ ajout), contacts (+ ajout), volontés, personnes
de confiance, patrimoine, assurances, abonnements, animaux, checklist
famille, notifications, profil, paramètres, export.
