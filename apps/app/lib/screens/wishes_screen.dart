import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_client.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/legal_disclaimer_banner.dart';

class WishesScreen extends StatelessWidget {
  const WishesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.read<ApiClient>();

    return AppScaffold(
      title: 'Mes volontés',
      body: FutureBuilder(
        future: api.get('/living-profile/wishes'),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final wishes = (snapshot.data as List).cast<Map<String, dynamic>>();
          return ListView(
            padding: const EdgeInsets.only(bottom: 16),
            children: [
              const LegalDisclaimerBanner(),
              if (wishes.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(24),
                  child: Text('Vous n’avez pas encore exprimé de volonté.'),
                )
              else
                ...wishes.map(
                  (wish) => Card(
                    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    child: ListTile(
                      title: Text(wish['title'] ?? wish['category'] ?? ''),
                      subtitle: Text(wish['content'] ?? ''),
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
