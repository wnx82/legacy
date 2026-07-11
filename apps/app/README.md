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

`flutter_appauth` fonctionne nativement sur Android et iOS (schéma
personnalisé `legacy://callback`). Sur Windows, macOS et Linux, il ne gère
pas le retour de redirection ; **le flux desktop est désormais implémenté**
(`lib/services/auth_service.dart`, `_loginDesktop`) selon le patron
« loopback » recommandé par la RFC 8252 (§7.3) :

1. récupération du document de découverte OIDC (`_discoveryUrlEnv`) ;
2. génération d'un `code_verifier` / `code_challenge` PKCE (SHA-256) ;
3. démarrage d'un serveur HTTP éphémère sur `127.0.0.1:<port aléatoire>` ;
4. ouverture du navigateur système (`url_launcher`) vers l'`authorization_endpoint`
   avec `redirect_uri=http://localhost:<port>/callback` ;
5. réception du `code` sur le serveur local (vérification du `state`), page de
   confirmation, puis échange `code` → token au `token_endpoint` ;
6. stockage des tokens dans le coffre natif (`flutter_secure_storage`).

Le realm Keycloak autorise déjà `http://localhost:*/*` pour le client
`legacy-app` (`infra/keycloak/realm-export.json`). La sélection mobile/desktop
est automatique (`_isDesktop`).

> Note : l'application Flutter n'a pas pu être compilée/exécutée dans
> l'environnement d'intervention (SDK Flutter absent) ; ce flux est fourni
> complet et conforme au standard, mais son exécution reste **à vérifier** sur
> une machine desktop équipée du SDK Flutter (`flutter run -d windows|macos|linux`).

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
