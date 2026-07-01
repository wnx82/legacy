import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _loading = false;
  String? _error;

  Future<void> _handleLogin() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final success = await context.read<AuthService>().login();
      if (success && mounted) context.go('/dashboard');
    } catch (e) {
      setState(() => _error = 'Connexion impossible. Veuillez réessayer.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Connexion à Legacy', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              const Text(
                "L'authentification est gérée de manière sécurisée par notre fournisseur d'identité.",
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 32),
              if (_error != null) Padding(padding: const EdgeInsets.only(bottom: 16), child: Text(_error!, style: const TextStyle(color: Colors.red))),
              ElevatedButton(
                onPressed: _loading ? null : _handleLogin,
                child: Text(_loading ? 'Connexion…' : 'Se connecter'),
              ),
              const SizedBox(height: 12),
              TextButton(onPressed: () => context.go('/register'), child: const Text('Créer un compte')),
            ],
          ),
        ),
      ),
    );
  }
}
