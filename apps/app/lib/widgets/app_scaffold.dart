import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';

class NavEntry {
  final String label;
  final IconData icon;
  final String route;
  const NavEntry(this.label, this.icon, this.route);
}

const kNavEntries = [
  NavEntry('Tableau de bord', Icons.dashboard_outlined, '/dashboard'),
  NavEntry('Mon dossier', Icons.trending_up, '/living-profile/progress'),
  NavEntry('Documents', Icons.folder_outlined, '/documents'),
  NavEntry('Contacts', Icons.contacts_outlined, '/contacts'),
  NavEntry('Volontés', Icons.favorite_outline, '/wishes'),
  NavEntry('Personnes de confiance', Icons.shield_outlined, '/trusted-persons'),
  NavEntry('Patrimoine', Icons.account_balance_outlined, '/assets'),
  NavEntry('Assurances', Icons.health_and_safety_outlined, '/insurances'),
  NavEntry('Abonnements', Icons.subscriptions_outlined, '/subscriptions'),
  NavEntry('Animaux', Icons.pets_outlined, '/pets'),
  NavEntry('Checklist famille', Icons.checklist_outlined, '/family-checklist'),
  NavEntry('Notifications', Icons.notifications_outlined, '/notifications'),
  NavEntry('Export', Icons.download_outlined, '/export'),
  NavEntry('Profil', Icons.person_outline, '/profile'),
  NavEntry('Paramètres', Icons.settings_outlined, '/settings'),
];

/// Coque commune à tous les écrans authentifiés : app bar + menu latéral.
/// Un Drawer plutôt qu'une bottom nav bar, car la quinzaine de sections ne
/// tiendrait pas dans une barre inférieure sur mobile.
class AppScaffold extends StatelessWidget {
  final String title;
  final Widget body;
  final Widget? floatingActionButton;

  const AppScaffold({super.key, required this.title, required this.body, this.floatingActionButton});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      drawer: Drawer(
        child: SafeArea(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              const DrawerHeader(
                child: Text('Legacy', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              ),
              ...kNavEntries.map(
                (entry) => ListTile(
                  leading: Icon(entry.icon),
                  title: Text(entry.label),
                  onTap: () {
                    Navigator.pop(context);
                    context.go(entry.route);
                  },
                ),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.logout),
                title: const Text('Déconnexion'),
                onTap: () => context.read<AuthService>().logout(),
              ),
            ],
          ),
        ),
      ),
      body: SafeArea(child: body),
      floatingActionButton: floatingActionButton,
    );
  }
}
