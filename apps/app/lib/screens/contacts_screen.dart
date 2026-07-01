import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/api_client.dart';
import '../widgets/app_scaffold.dart';

class ContactsScreen extends StatelessWidget {
  const ContactsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.read<ApiClient>();

    return AppScaffold(
      title: 'Mes contacts',
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/contacts/add'),
        child: const Icon(Icons.add),
      ),
      body: FutureBuilder(
        future: api.get('/living-profile/contacts'),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final contacts = (snapshot.data as List).cast<Map<String, dynamic>>();
          if (contacts.isEmpty) return const Center(child: Text('Aucun contact ajouté pour le moment.'));
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: contacts.length,
            itemBuilder: (context, index) {
              final contact = contacts[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: const Icon(Icons.person_outline),
                  title: Text('${contact['firstName']} ${contact['lastName'] ?? ''}'),
                  subtitle: Text(contact['relationship'] ?? contact['category'] ?? ''),
                  trailing: Text(contact['phone'] ?? ''),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
