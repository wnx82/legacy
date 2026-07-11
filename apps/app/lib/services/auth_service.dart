import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_appauth/flutter_appauth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

/// Authentification OpenID Connect auprès de Keycloak (Authorization Code +
/// PKCE). Le token est stocké dans le Keystore/Keychain natif — jamais en
/// clair.
///
/// - **Mobile (Android/iOS)** : `flutter_appauth` avec le schéma personnalisé
///   `legacy://callback`.
/// - **Desktop (Windows/macOS/Linux)** : `flutter_appauth` ne gère pas le
///   retour de redirection ; on implémente donc un flux « loopback » standard
///   (RFC 8252, section 7.3) — un petit serveur HTTP local sur `127.0.0.1:<port
///   aléatoire>` reçoit le `code`, échangé ensuite contre un token. Le realm
///   autorise déjà `http://localhost:*/*` (infra/keycloak/realm-export.json).
class AuthService extends ChangeNotifier {
  static const _clientId = 'legacy-app';
  static const _mobileRedirectUri = 'legacy://callback';
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

  bool get _isDesktop =>
      !kIsWeb && (Platform.isWindows || Platform.isMacOS || Platform.isLinux);

  Future<void> restoreSession() async {
    _accessToken = await _storage.read(key: 'access_token');
    _refreshToken = await _storage.read(key: 'refresh_token');
    notifyListeners();
  }

  Future<bool> login() async {
    final success = _isDesktop ? await _loginDesktop() : await _loginMobile();
    if (success) notifyListeners();
    return success;
  }

  Future<bool> _loginMobile() async {
    final result = await _appAuth.authorizeAndExchangeCode(
      AuthorizationTokenRequest(
        _clientId,
        _mobileRedirectUri,
        discoveryUrl: _discoveryUrlEnv,
        scopes: ['openid', 'profile', 'email'],
      ),
    );
    if (result.accessToken == null) return false;
    await _persistTokens(result.accessToken, result.refreshToken);
    return true;
  }

  /// Flux OIDC desktop via redirection loopback + PKCE.
  Future<bool> _loginDesktop() async {
    final discovery = await _fetchDiscovery();
    final authEndpoint = Uri.parse(discovery['authorization_endpoint'] as String);
    final tokenEndpoint = Uri.parse(discovery['token_endpoint'] as String);

    final codeVerifier = _randomUrlSafe(64);
    final codeChallenge = _computeCodeChallenge(codeVerifier);
    final state = _randomUrlSafe(24);

    // Serveur local éphémère : le système choisit un port libre.
    final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
    final redirectUri = 'http://localhost:${server.port}/callback';

    final authUrl = authEndpoint.replace(queryParameters: {
      'client_id': _clientId,
      'response_type': 'code',
      'scope': 'openid profile email',
      'redirect_uri': redirectUri,
      'state': state,
      'code_challenge': codeChallenge,
      'code_challenge_method': 'S256',
    });

    if (!await launchUrl(authUrl, mode: LaunchMode.externalApplication)) {
      await server.close(force: true);
      return false;
    }

    try {
      final request = await server.first.timeout(const Duration(minutes: 5));
      final params = request.uri.queryParameters;
      _respondAndClose(request);

      if (params['state'] != state || params['code'] == null) return false;

      final tokens = await _exchangeCode(
        tokenEndpoint: tokenEndpoint,
        code: params['code']!,
        redirectUri: redirectUri,
        codeVerifier: codeVerifier,
      );
      if (tokens == null) return false;
      await _persistTokens(tokens['access_token'] as String?, tokens['refresh_token'] as String?);
      return _accessToken != null;
    } finally {
      await server.close(force: true);
    }
  }

  Future<Map<String, dynamic>> _fetchDiscovery() async {
    final res = await http.get(Uri.parse(_discoveryUrlEnv));
    if (res.statusCode != 200) {
      throw Exception('Découverte OIDC indisponible (${res.statusCode})');
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>?> _exchangeCode({
    required Uri tokenEndpoint,
    required String code,
    required String redirectUri,
    required String codeVerifier,
  }) async {
    final res = await http.post(
      tokenEndpoint,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {
        'grant_type': 'authorization_code',
        'client_id': _clientId,
        'code': code,
        'redirect_uri': redirectUri,
        'code_verifier': codeVerifier,
      },
    );
    if (res.statusCode != 200) return null;
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  void _respondAndClose(HttpRequest request) {
    request.response
      ..statusCode = 200
      ..headers.contentType = ContentType.html
      ..write(
        '<!doctype html><html lang="fr"><head><meta charset="utf-8">'
        '<title>Legacy</title></head><body style="font-family:sans-serif;text-align:center;padding:48px">'
        '<h2>Connexion réussie</h2>'
        '<p>Vous pouvez fermer cet onglet et revenir à l\'application Legacy.</p>'
        '</body></html>',
      );
    request.response.close();
  }

  Future<void> _persistTokens(String? accessToken, String? refreshToken) async {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    if (accessToken != null) await _storage.write(key: 'access_token', value: accessToken);
    if (refreshToken != null) await _storage.write(key: 'refresh_token', value: refreshToken);
  }

  String _randomUrlSafe(int bytes) {
    final rng = Random.secure();
    final values = List<int>.generate(bytes, (_) => rng.nextInt(256));
    return base64UrlEncode(values).replaceAll('=', '');
  }

  String _computeCodeChallenge(String verifier) {
    final digest = sha256.convert(ascii.encode(verifier));
    return base64UrlEncode(digest.bytes).replaceAll('=', '');
  }

  Future<void> logout() async {
    _accessToken = null;
    _refreshToken = null;
    await _storage.deleteAll();
    notifyListeners();
  }
}
