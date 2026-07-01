import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';

/// L'inscription passe par le même flux OpenID Connect que la connexion —
/// Keycloak affiche son propre formulaire d'inscription (kc_action=register).
/// L'app ne gère jamais de mot de passe directement.
class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

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
              const Text('Créer votre compte Legacy', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              const Text(
                'Quelques informations suffisent pour commencer à préparer votre dossier.',
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () async {
                  final success = await context.read<AuthService>().login();
                  if (success && context.mounted) context.go('/dashboard');
                },
                child: const Text('Créer mon compte'),
              ),
              const SizedBox(height: 12),
              TextButton(onPressed: () => context.go('/login'), child: const Text('J’ai déjà un compte')),
            ],
          ),
        ),
      ),
    );
  }
}
