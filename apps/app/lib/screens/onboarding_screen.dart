import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LegacyColors.lightBeige,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.shield_outlined, size: 64, color: LegacyColors.midnightBlue),
              const SizedBox(height: 24),
              const Text(
                'Préparez l’après,\naccompagnez ceux qu’on aime.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.w600, color: LegacyColors.midnightBlue),
              ),
              const SizedBox(height: 16),
              const Text(
                "Legacy vous aide à organiser vos informations importantes, à votre rythme, "
                "et à soulager vos proches le moment venu.",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 15, color: LegacyColors.softGray),
              ),
              const SizedBox(height: 40),
              ElevatedButton(
                onPressed: () => context.go('/register'),
                child: const Text('Préparer mon dossier'),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => context.go('/login'),
                child: const Text('J’ai déjà un compte'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
