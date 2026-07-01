import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_client.dart';
import '../widgets/app_scaffold.dart';

class TrustedPersonsScreen extends StatelessWidget {
  const TrustedPersonsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.read<ApiClient>();

    return AppScaffold(
      title: 'Personnes de confiance',
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(context, api),
        child: const Icon(Icons.add),
      ),
      body: FutureBuilder(
        future: api.get('/living-profile/trusted-persons'),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final persons = (snapshot.data as List).cast<Map<String, dynamic>>();
          if (persons.isEmpty) {
            return const Center(child: Text('Désignez au moins une personne de confiance.'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: persons.length,
            itemBuilder: (context, index) {
              final person = persons[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: const Icon(Icons.shield_outlined),
                  title: Text('${person['firstName']} ${person['lastName']}'),
                  subtitle: Text(person['email'] ?? ''),
                ),
              );
            },
          );
        },
      ),
    );
  }

  void _showAddDialog(BuildContext context, ApiClient api) {
    final firstName = TextEditingController();
    final lastName = TextEditingController();
    final email = TextEditingController();
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Nouvelle personne de confiance'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: firstName, decoration: const InputDecoration(labelText: 'Prénom')),
            TextField(controller: lastName, decoration: const InputDecoration(labelText: 'Nom')),
            TextField(controller: email, decoration: const InputDecoration(labelText: 'E-mail')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () async {
              await api.post('/living-profile/trusted-persons', {
                'firstName': firstName.text,
                'lastName': lastName.text,
                'email': email.text,
                'canActivateAccess': false,
              });
              if (dialogContext.mounted) Navigator.pop(dialogContext);
            },
            child: const Text('Ajouter'),
          ),
        ],
      ),
    );
  }
}
