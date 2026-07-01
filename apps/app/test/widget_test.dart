// Test de fumée : vérifie que l'application démarre et affiche l'écran
// d'accueil (onboarding) pour un utilisateur non authentifié.

import 'package:flutter_test/flutter_test.dart';
import 'package:legacy_app/app.dart';

void main() {
  testWidgets("L'application démarre sur l'écran d'onboarding", (WidgetTester tester) async {
    await tester.pumpWidget(const LegacyApp());
    await tester.pumpAndSettle();

    expect(find.textContaining('Préparez l’après'), findsOneWidget);
  });
}
