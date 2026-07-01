import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/api_client.dart';
import '../widgets/app_scaffold.dart';

class DocumentsScreen extends StatelessWidget {
  const DocumentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.read<ApiClient>();

    return AppScaffold(
      title: 'Mes documents',
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/documents/add'),
        child: const Icon(Icons.add),
      ),
      body: FutureBuilder(
        future: api.get('/living-profile/documents'),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final documents = (snapshot.data as List).cast<Map<String, dynamic>>();
          if (documents.isEmpty) {
            return const Center(child: Text('Aucun document ajouté pour le moment.'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: documents.length,
            itemBuilder: (context, index) {
              final doc = documents[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: const Icon(Icons.description_outlined),
                  title: Text(doc['filename'] ?? ''),
                  subtitle: Text(doc['category']?['label'] ?? ''),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
