import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_client.dart';
import '../widgets/app_scaffold.dart';

/// Checklist d'un dossier décès pour un proche. L'identifiant du dossier est
/// fourni via le lien d'invitation (deep link `legacy://family?dossier=<id>`,
/// à finaliser en Phase 1 — voir docs/roadmap.md) ; en attendant, il peut
/// être saisi manuellement.
class FamilyChecklistScreen extends StatefulWidget {
  const FamilyChecklistScreen({super.key});

  @override
  State<FamilyChecklistScreen> createState() => _FamilyChecklistScreenState();
}

class _FamilyChecklistScreenState extends State<FamilyChecklistScreen> {
  final _caseIdController = TextEditingController();
  String? _caseId;

  @override
  Widget build(BuildContext context) {
    final api = context.read<ApiClient>();

    return AppScaffold(
      title: 'Checklist famille',
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _caseIdController,
                    decoration: const InputDecoration(labelText: 'Identifiant du dossier décès'),
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: () => setState(() => _caseId = _caseIdController.text),
                  child: const Text('Afficher'),
                ),
              ],
            ),
          ),
          if (_caseId != null)
            Expanded(
              child: FutureBuilder(
                future: api.get('/death-cases/$_caseId/tasks'),
                builder: (context, snapshot) {
                  if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
                  final tasks = (snapshot.data as List).cast<Map<String, dynamic>>().where((t) => t['visibleToFamily'] == true);
                  return ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: tasks
                        .map(
                          (task) => Card(
                            margin: const EdgeInsets.only(bottom: 10),
                            child: ListTile(title: Text(task['title'] ?? ''), subtitle: Text(task['status'] ?? '')),
                          ),
                        )
                        .toList(),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
