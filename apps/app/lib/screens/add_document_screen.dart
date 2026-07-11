import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../services/api_client.dart';

const _categories = [
  ('identity', 'Identité'),
  ('health', 'Santé'),
  ('insurance', 'Assurance'),
  ('bank', 'Banque'),
  ('housing', 'Logement'),
  ('succession', 'Succession'),
  ('family', 'Famille'),
  ('other', 'Autres'),
];

class AddDocumentScreen extends StatefulWidget {
  const AddDocumentScreen({super.key});

  @override
  State<AddDocumentScreen> createState() => _AddDocumentScreenState();
}

class _AddDocumentScreenState extends State<AddDocumentScreen> {
  String _category = 'identity';
  bool _uploading = false;

  Future<void> _pickAndUpload() async {
    final api = context.read<ApiClient>();
    final result = await FilePicker.platform.pickFiles(withData: true);
    if (result == null || result.files.single.bytes == null) return;

    final file = result.files.single;
    setState(() => _uploading = true);
    try {
      final response = await api.post('/living-profile/documents', {
        'filename': file.name,
        'mimeType': 'application/octet-stream',
        'sizeBytes': file.size,
        'categoryKey': _category,
      });
      final uploadUrl = response['uploadUrl'] as String;
      final documentId = (response['document'] as Map<String, dynamic>?)?['id'] as String?;
      await http.put(Uri.parse(uploadUrl), body: file.bytes);
      // Confirme la fin de l'upload : déclenche checksum + scan antivirus côté API.
      if (documentId != null) {
        await api.post('/documents/$documentId/confirm', {});
      }
      if (mounted) context.pop();
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ajouter un document')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Catégorie'),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              initialValue: _category,
              items: _categories.map((c) => DropdownMenuItem(value: c.$1, child: Text(c.$2))).toList(),
              onChanged: (value) => setState(() => _category = value ?? _category),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _uploading ? null : _pickAndUpload,
              icon: const Icon(Icons.upload_file),
              label: Text(_uploading ? 'Envoi…' : 'Choisir un fichier'),
            ),
          ],
        ),
      ),
    );
  }
}
