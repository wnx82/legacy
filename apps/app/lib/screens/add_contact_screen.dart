import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/api_client.dart';

class AddContactScreen extends StatefulWidget {
  const AddContactScreen({super.key});

  @override
  State<AddContactScreen> createState() => _AddContactScreenState();
}

class _AddContactScreenState extends State<AddContactScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _relationship = TextEditingController();
  final _phone = TextEditingController();
  bool _saving = false;

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await context.read<ApiClient>().post('/living-profile/contacts', {
        'category': 'FAMILY',
        'firstName': _firstName.text,
        'lastName': _lastName.text,
        'relationship': _relationship.text,
        'phone': _phone.text,
        'priority': 'NORMAL',
        'visibleToFamily': true,
        'visibleToPro': false,
      });
      if (mounted) context.pop();
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ajouter un contact')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _firstName,
              decoration: const InputDecoration(labelText: 'Prénom'),
              validator: (v) => v == null || v.isEmpty ? 'Champ requis' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(controller: _lastName, decoration: const InputDecoration(labelText: 'Nom')),
            const SizedBox(height: 12),
            TextFormField(controller: _relationship, decoration: const InputDecoration(labelText: 'Relation')),
            const SizedBox(height: 12),
            TextFormField(controller: _phone, decoration: const InputDecoration(labelText: 'Téléphone')),
            const SizedBox(height: 24),
            ElevatedButton(onPressed: _saving ? null : _save, child: Text(_saving ? 'Enregistrement…' : 'Enregistrer')),
          ],
        ),
      ),
    );
  }
}
