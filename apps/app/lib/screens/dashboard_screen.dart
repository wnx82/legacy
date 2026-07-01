import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/api_client.dart';
import '../theme.dart';
import '../widgets/app_scaffold.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.read<ApiClient>();

    return AppScaffold(
      title: 'Tableau de bord',
      body: FutureBuilder(
        future: api.get('/living-profile/progress'),
        builder: (context, snapshot) {
          final progress = (snapshot.data?['progressPercent'] as num?)?.toInt() ?? 0;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Progression de mon dossier', style: TextStyle(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 12),
                      LinearProgressIndicator(
                        value: progress / 100,
                        minHeight: 8,
                        backgroundColor: LegacyColors.softGrayLight,
                        color: LegacyColors.sageGreen,
                      ),
                      const SizedBox(height: 8),
                      Text('$progress % complété', style: const TextStyle(color: LegacyColors.softGray)),
                      const SizedBox(height: 12),
                      OutlinedButton(
                        onPressed: () => context.go('/living-profile/progress'),
                        child: const Text('Continuer mon dossier'),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              _QuickLink(icon: Icons.folder_outlined, label: 'Documents', route: '/documents'),
              _QuickLink(icon: Icons.favorite_outline, label: 'Mes volontés', route: '/wishes'),
              _QuickLink(icon: Icons.shield_outlined, label: 'Personnes de confiance', route: '/trusted-persons'),
              _QuickLink(icon: Icons.checklist_outlined, label: 'Checklist famille', route: '/family-checklist'),
            ],
          );
        },
      ),
    );
  }
}

class _QuickLink extends StatelessWidget {
  final IconData icon;
  final String label;
  final String route;

  const _QuickLink({required this.icon, required this.label, required this.route});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: LegacyColors.midnightBlue),
        title: Text(label),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => context.go(route),
      ),
    );
  }
}
