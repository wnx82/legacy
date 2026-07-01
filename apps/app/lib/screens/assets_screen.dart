import 'package:flutter/material.dart';
import '../widgets/simple_list_screen.dart';

class AssetsScreen extends StatelessWidget {
  const AssetsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SimpleListScreen(
      title: 'Patrimoine',
      endpoint: '/living-profile/assets',
      emptyLabel: 'Aucun bien renseigné pour le moment.',
      icon: Icons.account_balance_outlined,
      titleBuilder: (item) => item['name'] ?? '',
      subtitleBuilder: (item) => item['type'] ?? '',
    );
  }
}
