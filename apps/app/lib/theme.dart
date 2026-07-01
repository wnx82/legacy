import 'package:flutter/material.dart';

/// Palette portée depuis packages/design-system/src/tokens.ts — garder les
/// deux fichiers synchronisés si les couleurs évoluent.
class LegacyColors {
  static const midnightBlue = Color(0xFF0B1E3D);
  static const white = Color(0xFFFFFFFF);
  static const lightBeige = Color(0xFFF5F1EA);
  static const softGray = Color(0xFF6B7280);
  static const softGrayLight = Color(0xFFE5E7EB);
  static const sageGreen = Color(0xFF7C9885);
  static const sageGreenLight = Color(0xFFE4EDE7);
  static const discreetRed = Color(0xFFB3261E);
  static const discreetRedLight = Color(0xFFFBEAE9);
  static const discreetOrange = Color(0xFFB5620A);
  static const discreetOrangeLight = Color(0xFFFBF0E1);
}

ThemeData buildLegacyTheme() {
  final base = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: LegacyColors.midnightBlue,
      primary: LegacyColors.midnightBlue,
      secondary: LegacyColors.sageGreen,
      error: LegacyColors.discreetRed,
      surface: LegacyColors.white,
    ),
    scaffoldBackgroundColor: LegacyColors.lightBeige,
  );

  return base.copyWith(
    appBarTheme: const AppBarTheme(
      backgroundColor: LegacyColors.white,
      foregroundColor: LegacyColors.midnightBlue,
      elevation: 0,
      centerTitle: false,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: LegacyColors.midnightBlue,
        foregroundColor: LegacyColors.white,
        minimumSize: const Size.fromHeight(52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        minimumSize: const Size.fromHeight(52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    ),
    cardTheme: CardThemeData(
      color: LegacyColors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: LegacyColors.softGrayLight),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: LegacyColors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: LegacyColors.softGrayLight),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
  );
}
