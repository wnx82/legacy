import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_client.dart';
import '../widgets/app_scaffold.dart';

class ExportScreen extends StatefulWidget {
  const ExportScreen({super.key});

  @override
  State<ExportScreen> createState() => _ExportScreenState();
}

class _ExportScreenState extends State<ExportScreen> {
  bool _requested = false;

  @override
  Widget build(BuildContext context) {
    final api = context.read<ApiClient>();

    return AppScaffold(
      title: 'Exporter mon dossier',
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Générez un export PDF de votre dossier vivant pour le conserver ou le transmettre à une personne de confiance.',
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _requested
                  ? null
                  : () async {
                      final profile = await api.get('/living-profile');
                      await api.post('/exports/pdf', {
                        'type': 'PDF_LIVING_PROFILE',
                        'targetId': profile['id'],
                      });
                      setState(() => _requested = true);
                    },
              child: Text(_requested ? 'Export en préparation…' : 'Générer un export PDF'),
            ),
          ],
        ),
      ),
    );
  }
}
