import Link from 'next/link';
import { Button, Card, CardTitle, CardDescription } from '@legacy/design-system';

const WHY_LEGACY = [
  'Après un décès, les proches sont souvent perdus.',
  'Les documents sont parfois introuvables.',
  'Les volontés ne sont pas toujours connues.',
  'Les démarches sont nombreuses.',
  'Les familles ont besoin d’un guide simple.',
];

const FOR_INDIVIDUALS = [
  'Préparer son dossier de son vivant.',
  'Ajouter ses documents.',
  'Indiquer ses volontés non légales.',
  'Désigner une personne de confiance.',
  'Soulager ses proches.',
];

const FOR_FAMILIES = [
  'Suivre les démarches après décès.',
  'Consulter les informations partagées.',
  'Envoyer les documents demandés.',
  'Voir les étapes restantes.',
  'Collaborer avec la pompe funèbre.',
];

const FOR_FUNERAL_HOMES = [
  'Créer un dossier décès.',
  'Inviter la famille.',
  'Centraliser les documents.',
  'Suivre les formalités.',
  'Proposer Legacy en prévoyance.',
  'Moderniser l’accompagnement client.',
];

const FEATURES = [
  'Coffre-fort documents',
  'Volontés personnelles',
  'Contacts importants',
  'Formalités guidées',
  'Espace famille',
  'Portail professionnel',
  'Notifications',
  'Export PDF',
  'Gestion des personnes de confiance',
];

const SECURITY_POINTS = [
  'Données sensibles protégées.',
  'Accès contrôlés.',
  'Chiffrement des documents.',
  'Journalisation des accès.',
  'RGPD.',
  'Hébergement européen recommandé.',
];

const HOW_IT_WORKS = [
  'Je crée mon dossier.',
  'J’ajoute mes informations.',
  'Je désigne mes personnes de confiance.',
  'Ma famille est guidée si nécessaire.',
  'La pompe funèbre peut accompagner les démarches.',
];

const FAQ = [
  {
    q: 'Legacy remplace-t-il un testament ?',
    a: "Non. Legacy est un assistant d'organisation et un coffre-fort documentaire. Il ne remplace pas un notaire, un avocat, un testament légal ou un avis juridique.",
  },
  {
    q: 'Qui peut voir mes données ?',
    a: 'Vous seul, par défaut. Vous choisissez précisément ce qui est visible par vos personnes de confiance ou vos proches, et à quel moment.',
  },
  {
    q: 'Comment mes proches auront-ils accès ?',
    a: "Via un système d'accès après décès prudent : activation contrôlée, validation possible par une pompe funèbre, traçabilité complète.",
  },
  {
    q: 'Les pompes funèbres peuvent-elles utiliser Legacy ?',
    a: 'Oui, via un portail professionnel dédié pour créer des dossiers décès, inviter les familles et suivre les formalités.',
  },
  {
    q: 'Où sont stockées les données ?',
    a: 'Sur une infrastructure hébergée en Europe (recommandé), avec documents chiffrés et accès journalisés.',
  },
  {
    q: 'Puis-je supprimer mes données ?',
    a: 'Oui, à tout moment, conformément au RGPD (voir notre page Confidentialité).',
  },
  {
    q: 'Puis-je exporter mes données ?',
    a: 'Oui, en PDF ou en export RGPD complet, depuis votre tableau de bord.',
  },
];

function SectionTitle({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="mb-10 text-center">
      {eyebrow && <p className="text-sm font-medium uppercase tracking-wide text-sage">{eyebrow}</p>}
      <h2 className="mt-2 text-2xl font-semibold text-midnight sm:text-3xl">{title}</h2>
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-beige px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-semibold text-midnight sm:text-5xl">
            Préparez l’après, accompagnez ceux qu’on aime.
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Legacy aide les particuliers à organiser leurs informations importantes de leur vivant, les familles à
            suivre les démarches après un décès, et les pompes funèbres à accompagner leurs clients avec un outil
            numérique simple et sécurisé.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg">Préparer mon dossier</Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="ghost">
                Demander une démo professionnelle
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pourquoi Legacy */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionTitle title="Pourquoi Legacy ?" />
          <ul className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
            {WHY_LEGACY.map((item) => (
              <li key={item} className="rounded-md bg-beige p-4 text-gray-700">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trois publics */}
      <section className="bg-beige px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionTitle title="Un accompagnement pour chacun" />
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardTitle>Pour les particuliers</CardTitle>
              <CardDescription>Préparer son dossier de son vivant, sans démarche légale.</CardDescription>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                {FOR_INDIVIDUALS.map((i) => (
                  <li key={i}>• {i}</li>
                ))}
              </ul>
              <Link href="/particuliers" className="mt-4 inline-block text-sm font-medium text-sage hover:underline">
                En savoir plus →
              </Link>
            </Card>
            <Card>
              <CardTitle>Pour les familles</CardTitle>
              <CardDescription>Être guidé après un décès, sans se sentir seul.</CardDescription>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                {FOR_FAMILIES.map((i) => (
                  <li key={i}>• {i}</li>
                ))}
              </ul>
              <Link href="/familles" className="mt-4 inline-block text-sm font-medium text-sage hover:underline">
                En savoir plus →
              </Link>
            </Card>
            <Card>
              <CardTitle>Pour les pompes funèbres</CardTitle>
              <CardDescription>Moderniser l'accompagnement client.</CardDescription>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                {FOR_FUNERAL_HOMES.map((i) => (
                  <li key={i}>• {i}</li>
                ))}
              </ul>
              <Link href="/pompes-funebres" className="mt-4 inline-block text-sm font-medium text-sage hover:underline">
                En savoir plus →
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionTitle title="Fonctionnalités principales" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f} className="rounded-md border border-gray-200 p-4 text-center text-sm font-medium text-midnight">
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sécurité */}
      <section className="bg-midnight px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <SectionTitle title="Sécurité et confidentialité" />
          <ul className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
            {SECURITY_POINTS.map((item) => (
              <li key={item} className="rounded-md bg-white/10 p-4">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center">
            <Link href="/securite" className="text-sm font-medium text-sage-light hover:underline">
              En savoir plus sur la sécurité →
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça fonctionne */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <SectionTitle title="Comment ça fonctionne ?" />
          <ol className="space-y-4">
            {HOW_IT_WORKS.map((step, index) => (
              <li key={step} className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="pt-1 text-gray-700">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tarifs (résumé) */}
      <section className="bg-beige px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle title="Des offres simples" />
          <p className="text-gray-600">
            Offre gratuite pour les particuliers, offre Plus pour aller plus loin, et une offre Pro pensée pour les
            pompes funèbres.
          </p>
          <Link href="/tarifs" className="mt-4 inline-block">
            <Button variant="secondary">Voir les tarifs</Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <SectionTitle title="Questions fréquentes" />
          <div className="space-y-6">
            {FAQ.map((item) => (
              <div key={item.q} className="border-b border-gray-200 pb-6">
                <p className="font-medium text-midnight">{item.q}</p>
                <p className="mt-2 text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-midnight px-6 py-20 text-center text-white">
        <h2 className="text-2xl font-semibold sm:text-3xl">Prêt à commencer ?</h2>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Préparer mon dossier
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="ghost" className="border-white text-white hover:bg-white/10">
              Demander une démo professionnelle
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
