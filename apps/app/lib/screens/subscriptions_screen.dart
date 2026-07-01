import 'package:flutter/material.dart';
import '../widgets/simple_list_screen.dart';

class SubscriptionsScreen extends StatelessWidget {
  const SubscriptionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SimpleListScreen(
      title: 'Abonnements et comptes',
      endpoint: '/living-profile/subscriptions',
      emptyLabel: 'Aucun abonnement renseigné pour le moment.',
      icon: Icons.subscriptions_outlined,
      titleBuilder: (item) => item['serviceName'] ?? '',
      subtitleBuilder: (item) => item['desiredAction'] ?? '',
    );
  }
}
