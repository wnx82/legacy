import 'package:flutter/material.dart';
import '../theme.dart';

/// Avertissement légal obligatoire — voir docs/product.md.
class LegalDisclaimerBanner extends StatelessWidget {
  final String text;

  const LegalDisclaimerBanner({
    super.key,
    this.text =
        "Legacy ne remplace pas un notaire, un avocat, un testament légal ou un avis juridique. Les informations encodées servent à guider vos proches, mais ne constituent pas un acte légal.",
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: LegacyColors.sageGreenLight,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(text, style: const TextStyle(color: LegacyColors.midnightBlue, fontSize: 13)),
    );
  }
}
