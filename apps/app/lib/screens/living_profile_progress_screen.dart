import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/api_client.dart';
import '../theme.dart';
import '../widgets/app_scaffold.dart';

class LivingProfileProgressScreen extends StatelessWidget {
  const LivingProfileProgressScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.read<ApiClient>();
    const sections = [
      ('Informations personnelles', Icons.badge_outlined, '/profile'),
      ('Documents', Icons.folder_outlined, '/documents'),
      ('Volontés', Icons.favorite_outline, '/wishes'),
      ('Contacts', Icons.contacts_outlined, '/contacts'),
      ('Personnes de confiance', Icons.shield_outlined, '/trusted-persons'),
      ('Patrimoine', Icons.account_balance_outlined, '/assets'),
      ('Assurances', Icons.health_and_safety_outlined, '/insurances'),
      ('Abonnements', Icons.subscriptions_outlined, '/subscriptions'),
      ('Animaux', Icons.pets_outlined, '/pets'),
    ];

    return AppScaffold(
      title: 'Mon dossier vivant',
      body: FutureBuilder(
        future: api.get('/living-profile/progress'),
        builder: (context, snapshot) {
          final progress = (snapshot.data?['progressPercent'] as num?)?.toInt() ?? 0;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              LinearProgressIndicator(
                value: progress / 100,
                minHeight: 10,
                backgroundColor: LegacyColors.softGrayLight,
                color: LegacyColors.sageGreen,
              ),
              const SizedBox(height: 8),
              Text('$progress % complété', style: const TextStyle(color: LegacyColors.softGray)),
              const SizedBox(height: 20),
              ...sections.map(
                (s) => Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: ListTile(
                    leading: Icon(s.$2, color: LegacyColors.midnightBlue),
                    title: Text(s.$1),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.go(s.$3),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
