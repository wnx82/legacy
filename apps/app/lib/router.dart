import 'package:go_router/go_router.dart';
import 'services/auth_service.dart';
import 'screens/onboarding_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/living_profile_progress_screen.dart';
import 'screens/documents_screen.dart';
import 'screens/add_document_screen.dart';
import 'screens/contacts_screen.dart';
import 'screens/add_contact_screen.dart';
import 'screens/wishes_screen.dart';
import 'screens/trusted_persons_screen.dart';
import 'screens/assets_screen.dart';
import 'screens/insurances_screen.dart';
import 'screens/subscriptions_screen.dart';
import 'screens/pets_screen.dart';
import 'screens/family_checklist_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/export_screen.dart';

GoRouter buildRouter(AuthService authService) {
  return GoRouter(
    initialLocation: '/onboarding',
    refreshListenable: authService,
    redirect: (context, state) {
      final loggingIn = ['/onboarding', '/login', '/register'].contains(state.matchedLocation);
      if (!authService.isAuthenticated && !loggingIn) return '/onboarding';
      if (authService.isAuthenticated && loggingIn) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(path: '/onboarding', builder: (context, state) => const OnboardingScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
      GoRoute(path: '/dashboard', builder: (context, state) => const DashboardScreen()),
      GoRoute(path: '/living-profile/progress', builder: (context, state) => const LivingProfileProgressScreen()),
      GoRoute(
        path: '/documents',
        builder: (context, state) => const DocumentsScreen(),
        routes: [GoRoute(path: 'add', builder: (context, state) => const AddDocumentScreen())],
      ),
      GoRoute(
        path: '/contacts',
        builder: (context, state) => const ContactsScreen(),
        routes: [GoRoute(path: 'add', builder: (context, state) => const AddContactScreen())],
      ),
      GoRoute(path: '/wishes', builder: (context, state) => const WishesScreen()),
      GoRoute(path: '/trusted-persons', builder: (context, state) => const TrustedPersonsScreen()),
      GoRoute(path: '/assets', builder: (context, state) => const AssetsScreen()),
      GoRoute(path: '/insurances', builder: (context, state) => const InsurancesScreen()),
      GoRoute(path: '/subscriptions', builder: (context, state) => const SubscriptionsScreen()),
      GoRoute(path: '/pets', builder: (context, state) => const PetsScreen()),
      GoRoute(path: '/family-checklist', builder: (context, state) => const FamilyChecklistScreen()),
      GoRoute(path: '/notifications', builder: (context, state) => const NotificationsScreen()),
      GoRoute(path: '/profile', builder: (context, state) => const ProfileScreen()),
      GoRoute(path: '/settings', builder: (context, state) => const SettingsScreen()),
      GoRoute(path: '/export', builder: (context, state) => const ExportScreen()),
    ],
  );
}
