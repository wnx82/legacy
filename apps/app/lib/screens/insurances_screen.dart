import 'package:flutter/material.dart';
import '../widgets/simple_list_screen.dart';

class InsurancesScreen extends StatelessWidget {
  const InsurancesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SimpleListScreen(
      title: 'Assurances',
      endpoint: '/living-profile/insurances',
      emptyLabel: 'Aucune assurance renseignée pour le moment.',
      icon: Icons.health_and_safety_outlined,
      titleBuilder: (item) => item['provider'] ?? '',
      subtitleBuilder: (item) => item['type'] ?? '',
    );
  }
}
