import 'package:flutter/material.dart';
import '../widgets/simple_list_screen.dart';

class PetsScreen extends StatelessWidget {
  const PetsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SimpleListScreen(
      title: 'Animaux',
      endpoint: '/living-profile/pets',
      emptyLabel: 'Aucun animal renseigné pour le moment.',
      icon: Icons.pets_outlined,
      titleBuilder: (item) => item['name'] ?? '',
      subtitleBuilder: (item) => item['species'] ?? '',
    );
  }
}
