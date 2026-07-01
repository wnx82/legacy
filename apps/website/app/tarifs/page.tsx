import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardTitle, CardDescription } from '@legacy/design-system';

export const metadata: Metadata = {
  title: 'Tarifs',
  description: 'Une offre gratuite pour les particuliers, une offre Plus, et une offre Pro pour les pompes funèbres.',
};

const PLANS = [
  {
    name: 'Gratuit',
    price: '0 €',
    audience: 'Particuliers',
    features: ['Dossier vivant de base', 'Documents essentiels', 'Contacts et personnes de confiance', 'Export PDF'],
    cta: 'Commencer gratuitement',
    href: '/register',
  },
  {
    name: 'Plus',
    price: 'Sur devis',
    audience: 'Particuliers',
    features: ['Dossier vivant complet', 'Patrimoine, assurances, abonnements', 'Stockage étendu', 'Support prioritaire'],
    cta: 'Découvrir l’offre Plus',
    href: '/contact',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: 'Sur devis',
    audience: 'Pompes funèbres',
    features: ['Dossiers décès illimités', 'Portail collaborateurs', 'Personnalisation logo/couleurs', 'Statistiques'],
    cta: 'Demander une démo',
    href: '/demo',
  },
];

export default function TarifsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-center text-3xl font-semibold text-midnight">Des offres simples et transparentes</h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-600">
        Une offre marque blanche complète est prévue pour une phase ultérieure (voir notre roadmap).
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={plan.highlighted ? 'border-sage ring-1 ring-sage' : undefined}>
            <p className="text-sm font-medium uppercase text-sage">{plan.audience}</p>
            <CardTitle className="mt-1 text-2xl">{plan.name}</CardTitle>
            <p className="mt-2 text-3xl font-semibold text-midnight">{plan.price}</p>
            <CardDescription className="mt-4 space-y-2 text-gray-600">
              {plan.features.map((f) => (
                <div key={f}>• {f}</div>
              ))}
            </CardDescription>
            <Link href={plan.href} className="mt-6 block">
              <Button className="w-full" variant={plan.highlighted ? 'primary' : 'secondary'}>
                {plan.cta}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
