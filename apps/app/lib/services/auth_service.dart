import 'package:flutter_appauth/flutter_appauth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/foundation.dart';

/// Authentification OpenID Connect auprès de Keycloak (Authorization Code +
/// PKCE). Le token est stocké dans le Keystore/Keychain natif — jamais en
/// clair. Sur desktop (Windows/macOS/Linux), `flutter_appauth` nécessite un
/// gestionnaire de redirection personnalisé (schéma `legacy://callback`,
/// déjà déclaré côté Keycloak dans infra/keycloak/realm-export.json) ; voir
/// README.md pour le détail de la configuration par plateforme.
class AuthService extends ChangeNotifier {
  static const _clientId = 'legacy-app';
  static const _redirectUri = 'legacy://callback';
  static const _discoveryUrlEnv = String.fromEnvironment(
    'KEYCLOAK_DISCOVERY_URL',
    defaultValue: 'http://localhost:8080/realms/legacy/.well-known/openid-configuration',
  );

  final FlutterAppAuth _appAuth = const FlutterAppAuth();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  String? _accessToken;
  String? _refreshToken;
  bool get isAuthenticated => _accessToken != null;
  String? get accessToken => _accessToken;

  Future<void> restoreSession() async {
    _accessToken = await _storage.read(key: 'access_token');
    _refreshToken = await _storage.read(key: 'refresh_token');
    notifyListeners();
  }

  Future<bool> login() async {
    final result = await _appAuth.authorizeAndExchangeCode(
      AuthorizationTokenRequest(
        _clientId,
        _redirectUri,
        discoveryUrl: _discoveryUrlEnv,
        scopes: ['openid', 'profile', 'email'],
      ),
    );
    if (result.accessToken == null) return false;
    _accessToken = result.accessToken;
    _refreshToken = result.refreshToken;
    await _storage.write(key: 'access_token', value: _accessToken);
    await _storage.write(key: 'refresh_token', value: _refreshToken);
    notifyListeners();
    return true;
  }

  Future<void> logout() async {
    _accessToken = null;
    _refreshToken = null;
    await _storage.deleteAll();
    notifyListeners();
  }
}
