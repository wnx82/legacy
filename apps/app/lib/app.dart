import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'router.dart';
import 'services/api_client.dart';
import 'services/auth_service.dart';
import 'theme.dart';

class LegacyApp extends StatefulWidget {
  const LegacyApp({super.key});

  @override
  State<LegacyApp> createState() => _LegacyAppState();
}

class _LegacyAppState extends State<LegacyApp> {
  late final AuthService _authService;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _authService = AuthService()..restoreSession();
    _router = buildRouter(_authService);
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _authService),
        ProxyProvider<AuthService, ApiClient>(update: (_, auth, __) => ApiClient(auth)),
      ],
      child: MaterialApp.router(
        title: 'Legacy',
        debugShowCheckedModeBanner: false,
        theme: buildLegacyTheme(),
        routerConfig: _router,
      ),
    );
  }
}
