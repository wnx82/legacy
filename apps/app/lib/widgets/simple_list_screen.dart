import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_client.dart';
import 'app_scaffold.dart';

/// Écran liste générique — utilisé pour les modules simples (patrimoine,
/// assurances, abonnements, animaux) dont le schéma diffère mais dont
/// l'interaction (liste + champ résumé) est identique pour ce MVP.
class SimpleListScreen extends StatelessWidget {
  final String title;
  final String endpoint;
  final String emptyLabel;
  final IconData icon;
  final String Function(Map<String, dynamic> item) titleBuilder;
  final String Function(Map<String, dynamic> item)? subtitleBuilder;

  const SimpleListScreen({
    super.key,
    required this.title,
    required this.endpoint,
    required this.emptyLabel,
    required this.icon,
    required this.titleBuilder,
    this.subtitleBuilder,
  });

  @override
  Widget build(BuildContext context) {
    final api = context.read<ApiClient>();

    return AppScaffold(
      title: title,
      body: FutureBuilder(
        future: api.get(endpoint),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final items = (snapshot.data as List).cast<Map<String, dynamic>>();
          if (items.isEmpty) return Center(child: Text(emptyLabel));
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: Icon(icon),
                  title: Text(titleBuilder(item)),
                  subtitle: subtitleBuilder != null ? Text(subtitleBuilder!(item)) : null,
                ),
              );
            },
          );
        },
      ),
    );
  }
}
