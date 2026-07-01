import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class ApiClient {
  static const _baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:3001/api',
  );

  final AuthService authService;

  ApiClient(this.authService);

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (authService.accessToken != null) 'Authorization': 'Bearer ${authService.accessToken}',
      };

  Future<dynamic> get(String path) async {
    final response = await http.get(Uri.parse('$_baseUrl$path'), headers: _headers);
    return _decode(response);
  }

  Future<dynamic> post(String path, Map<String, dynamic> body) async {
    final response = await http.post(Uri.parse('$_baseUrl$path'), headers: _headers, body: jsonEncode(body));
    return _decode(response);
  }

  Future<dynamic> patch(String path, Map<String, dynamic> body) async {
    final response = await http.patch(Uri.parse('$_baseUrl$path'), headers: _headers, body: jsonEncode(body));
    return _decode(response);
  }

  Future<void> delete(String path) async {
    await http.delete(Uri.parse('$_baseUrl$path'), headers: _headers);
  }

  dynamic _decode(http.Response response) {
    if (response.statusCode >= 400) {
      throw Exception('Erreur API (${response.statusCode}) : ${response.body}');
    }
    if (response.body.isEmpty) return null;
    return jsonDecode(response.body);
  }
}
